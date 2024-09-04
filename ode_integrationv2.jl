using Sundials
using FFTW
using LoopVectorization

function fftconvolve2d(in1::Matrix{T}, in2::Matrix{T}; threshold=1e-10) where T<:Number
    s1 = size(in1)
    s2 = size(in2)

    # Calculate the padded size
    padded_size = (s1[1] + s2[1] - 1, s1[2] + s2[2] - 1)

    # Calculate the next power of 2 for efficient FFT
    next_power_of_2 = (2^ceil(Int, log2(padded_size[1])), 2^ceil(Int, log2(padded_size[2])))

    # Create padded arrays
    padded_in1 = zeros(Complex{Float64}, next_power_of_2)
    padded_in2 = zeros(Complex{Float64}, next_power_of_2)

    # Copy the original arrays into the padded arrays
    padded_in1[1:s1[1], 1:s1[2]] = in1
    padded_in2[1:s2[1], 1:s2[2]] = in2

    # Perform FFT on the padded arrays
    fft_in1 = fft(padded_in1)
    fft_in2 = fft(padded_in2)

    # Multiply the FFT results
    fft_result = fft_in1 .* fft_in2

    # Perform inverse FFT and apply thresholding
    result = real(ifft(fft_result))
    result[abs.(result) .< threshold] .= 0  # Set very small values to exact zero

    # Calculate the valid convolution area
    valid_rows = s1[1] + s2[1] - 1
    valid_cols = s1[2] + s2[2] - 1

    # Extract the valid part of the result
    valid_result = result[1:valid_rows, 1:valid_cols]

    # Calculate the start indices for centering the result
    start_row = div(s2[1], 2)
    start_col = div(s2[2], 2)

    # Return the centered result
    return valid_result[start_row+1:start_row+s1[1], start_col+1:start_col+s1[2]]
end

# Helper functions
activation(x) = 0.5 .* (abs.(x .+ 1) .- abs.(x .- 1))

function safe_activation(x)
    x_clamped = clamp.(x, -1e6, 1e6)  # Prevent extremely large values
    return activation(x_clamped)
end

function f!(du, u, p, t)
    Ib, Bu, tempA, n, m = p
    x_mat = reshape(u, n, m)
    @turbo for i in eachindex(x_mat)
        x_mat[i] = safe_activation(x_mat[i])
    end
    conv_result = fftconvolve2d(x_mat, tempA)
    @turbo for i in eachindex(du)
        du[i] = clamp(-u[i] + Ib + Bu[i] + conv_result[i], -1e6, 1e6)
    end
end

function solve_ode(image::Matrix{Float64}, Ib::Float64, tempA::Matrix{Float64}, tempB::Matrix{Float64}, t_span::Tuple{Float64,Float64}, initial_condition::Float64)
    println("Data arrived to julia")
    n, m = size(image)

    # Prepare initial conditions
    z0 = fill(initial_condition, n * m)
    println("Before Bu init")
    Bu = fftconvolve2d(image, tempB)
    println("After Bu init")  # Normalize image before convolution
    params = (Ib, Bu, tempA, n, m)

    # Set up and solve ODE problem
    println("Started the solving")
    prob = ODEProblem(f!, z0, t_span, params)
    sol = solve(prob, CVODE_BDF(linear_solver=:GMRES), reltol=1e-5, abstol=1e-8, maxiters=1000000)
    println("Ended the solving")
    # Process results
    z = sol[end]
    @turbo for i in eachindex(z)
        z[i] = safe_activation(z[i])
    end
    out_l = reshape(z, n, m)

    # Normalize to [0, 1] range
    min_val, max_val = extrema(out_l)
    @turbo for i in eachindex(out_l)
        out_l[i] = (out_l[i] - min_val) / (max_val - min_val)
    end

    # Clamp and scale to 0-255
    @turbo for i in eachindex(out_l)
        out_l[i] = round(UInt8, clamp(out_l[i], 0.0, 1.0) * 255)
    end

    return out_l
end
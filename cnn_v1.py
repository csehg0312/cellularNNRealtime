import julia
from julia import Julia
from julia import Main
import numpy as np
from PIL import Image as img
import os.path
import os
import psutil
import time
import pickle
import gc

from julia.api import Julia
jl = Julia(compiled_modules=False)

ROOT = os.getcwd()
IMAGES = os.path.join(ROOT, 'image')

def load_parameters_for_mode(mode):
    with open('settings.pkl', 'rb') as f:
        settings = pickle.load(f)
    return {
        'tempA': settings[f'{mode}A'],
        'tempB': settings[f'{mode}B'],
        't_span': settings[f'{mode}t'],
        'Ib': settings[f'{mode}Ib'],
        'initial_condition': settings[f'{mode}init']
    }

# Load the Julia module
Main.include("ode_integrationv2.jl")

# Ib = np.float64(-1.0)
# tempA = [[0.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]]
# tempB = [[-1.0, -1.0, -1.0], [-1.0, 8.0, -1.0], [-1.0, -1.0, -1.0]]
# # t_span = np.linspace(0, 10.0, num=2)
# t_span = np.linspace(0.0, 10.0, num=2)
# initial_condition = np.float64(0.0)

def cnnCall(image: np.array, mode:str):
    u = np.array(image, dtype=np.float64)
    
    parameters = load_parameters_for_mode(mode)
    
    print(f"Total system memory: {psutil.virtual_memory().total / (1024**3):.2f} GB")
    print(f"Available memory: {psutil.virtual_memory().available / (1024**3):.2f} GB")
    print(f"CPU usage: {psutil.cpu_percent()}%")

    start_time = time.time()
    result = Main.solve_ode(u, parameters['Ib'], parameters['tempA'], parameters['tempB'], parameters['t_span'], parameters['initial_condition'])
    end_time = time.time()

    print(f"Total execution time: {end_time - start_time:.2f} seconds")
    print(f"Process memory usage: {psutil.Process(os.getpid()).memory_info().rss / (1024**3):.2f} GB")

    del parameters
    gc.collect()
    if result is not None and result.size > 0:
        result_np = np.array(result, dtype=np.uint8)
        print(f"Result shape: {result_np.shape}")
        print(f"Result min: {result_np.min()}, max: {result_np.max()}")

        # Inverting the image
        result_np = 255 - result_np

        # Return the processed image
        return result_np
    else:
        print("Error: ODE solving failed or returned empty result")
        return None

def main():

    # Define parameters
    gray = img.open(os.path.join(IMAGES, 'image7.jpg')).convert('L').resize((480,640))

    u = np.array(gray, dtype=np.float64)

    # image = np.array([
    #     [0, 0, 0, 0, 255, 0, 0],
    #     [0, 0, 255, 0, 255, 255, 0],
    #     [0, 0, 0, 0, 0, 0, 255],
    #     [0, 0, 255, 0, 0, 0, 255],
    #     [0, 0, 0, 0, 0, 0, 255],
    #     [0, 0, 255, 0, 255, 255, 0],
    #     [0, 0, 0, 255, 0, 0, 0]
    # ], dtype=np.float64)
    # ----------------------------
    Ib = np.float64(-4.0)
    tempA = [[0.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]]
    tempB = [[-1.0, 0.0, 1.0], [0.0, 1.0, 0.0], [1.0, 0.0, -1.0]]
    # t_span = np.linspace(0, 10.0, num=2)
    t_span = np.linspace(0.0, 0.2, num=101)
    initial_condition = np.float64(0.0)

    print(f"Total system memory: {psutil.virtual_memory().total / (1024**3):.2f} GB")
    print(f"Available memory: {psutil.virtual_memory().available / (1024**3):.2f} GB")
    print(f"CPU usage: {psutil.cpu_percent()}%")

    start_time = time.time()
    result = Main.solve_ode(u, Ib, tempA, tempB, t_span, initial_condition)
    end_time = time.time()

    print(f"Total execution time: {end_time - start_time:.2f} seconds")
    print(f"Process memory usage: {psutil.Process(os.getpid()).memory_info().rss / (1024**3):.2f} GB")

    if result is not None and result.size > 0:
        result_np = np.array(result, dtype=np.uint8)
        print(f"Result shape: {result_np.shape}")
        print(f"Result min: {result_np.min()}, max: {result_np.max()}")
        result_np = np.array(result, dtype=np.uint8)
         # Convert result to numpy array
        result_np = np.array(result, dtype=np.uint8)


        #Inverting the image
        result_np = 255 - result_np

        # Save the result as an image
        result_image = img.fromarray(result_np)
        result_image.save("result7.png")

        print("Result saved as 'result7.png'")
    else:
        print("Error: ODE solving failed or returned empty result")


if __name__ == "__main__":
    main()
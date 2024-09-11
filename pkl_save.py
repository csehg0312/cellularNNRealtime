import numpy as np

#Creating the basic cnn parameters
#parameters source: https://github.com/ankitaggarwal011/PyCNN
#EdgeDetection
edge_detect_A = np.array([[0.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]])
edge_detect_B = np.array([[-1.0, -1.0, -1.0], [-1.0, 8.0, -1.0], [-1.0, -1.0, -1.0]])
edge_detect_t = np.linspace(0, 10.0, num=2)
edge_detect_Ib = -1.0
edge_detect_init = 0.0

#Grayscale Edge Detection
grayscale_edge_detect_A = np.array([[0.0, 0.0, 0.0], [0.0, 2.0, 0.0], [0.0, 0.0, 0.0]])
grayscale_edge_detect_B = np.array([[-1.0, -1.0, -1.0], [-1.0, 8.0, -1.0], [-1.0, -1.0, -1.0]])
grayscale_edge_detect_t = np.linspace(0, 1.0, num=101)
grayscale_edge_detect_Ib = -0.5
grayscale_edge_detect_init = 0.0

#Corner Detection
corner_detect_A = np.array([[0.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]])
corner_detect_B = np.array([[-1.0, -1.0, -1.0], [-1.0, 4.0, -1.0], [-1.0, -1.0, -1.0]])
corner_detect_t = np.linspace(0, 10.0, num=11)
corner_detect_Ib = -5.0
corner_detect_init = 0.0

#Diagonal line Detection
diagonal_line_detect_A = np.array([[0.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]])
diagonal_line_detect_B = np.array([[-1.0, 0.0, 1.0], [0.0, 1.0, 0.0], [1.0, 0.0, -1.0]])
diagonal_line_detect_t = np.linspace(0, 0.2, num=101)
diagonal_line_detect_Ib = -4.0
diagonal_line_detect_init = 0.0

#Inversion
inversion_A = np.array([[0.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]])
inversion_B = np.array([[0.0, 0.0, 0.0], [1.0, 1.0, 1.0], [0.0, 0.0, 0.0]])
inversion_t = np.linspace(0, 10.0, num=101)
inversion_Ib = -2.0
inversion_init = 0.0

#Optimal Edge Detection
optimal_edge_detect_A = np.array([[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]])
optimal_edge_detect_B = np.array([[-0.11, 0.0, 0.11], [-0.28, 0.0, 0.28], [-0.11, 0.0, 0.11]])
optimal_edge_detect_t = np.linspace(0, 10.0, num=101)
optimal_edge_detect_Ib = 0.0
optimal_edge_detect_init = 0.0

# Horizontal Line Detection
horizontal_line_detect_A = np.array([[0.0, 0.0, 0.0], [0.0, 2.0, 0.0], [0.0, 0.0, 0.0]])
horizontal_line_detect_B = np.array([[0.0, 1.0, 0.0], [0.0, 1.0, 0.0], [0.0, 1.0, 0.0]])
horizontal_line_detect_t = np.linspace(0, 1.0, num=101)
horizontal_line_detect_Ib = -3.0
horizontal_line_detect_init = 0.0

# Vertical Line Detection
vertical_line_detect_A = np.array([[0.0, 0.0, 0.0], [0.0, 2.0, 0.0], [0.0, 0.0, 0.0]])
vertical_line_detect_B = np.array([[0.0, 0.0, 0.0], [1.0, 1.0, 1.0], [0.0, 0.0, 0.0]])
vertical_line_detect_t = np.linspace(0, 1.0, num=101)
vertical_line_detect_Ib = -3.0
vertical_line_detect_init = 0.0

# Noise Removal
noise_removal_A = np.array([[0.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]])
noise_removal_B = np.array([[0.2, 0.2, 0.2], [0.2, 2.0, 0.2], [0.2, 0.2, 0.2]])
noise_removal_t = np.linspace(0, 5.0, num=101)
noise_removal_Ib = -1.0
noise_removal_init = 0.0

# Shadow Detection
shadow_detect_A = np.array([[0.0, 0.0, 0.0], [0.0, 2.0, 0.0], [0.0, 0.0, 0.0]])
shadow_detect_B = np.array([[-1.0, -1.0, -1.0], [-1.0, 9.0, -1.0], [-1.0, -1.0, -1.0]])
shadow_detect_t = np.linspace(0, 1.0, num=101)
shadow_detect_Ib = -0.5
shadow_detect_init = 0.0

# Connected Component Detection
connected_comp_A = np.array([[0.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 0.0]])
connected_comp_B = np.array([[0.25, 0.25, 0.25], [0.25, 2.0, 0.25], [0.25, 0.25, 0.25]])
connected_comp_t = np.linspace(0, 10.0, num=101)
connected_comp_Ib = -0.5
connected_comp_init = 0.0

#in case of saved parameters: 
saved_A = np.array([[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]])
saved_B = np.array([[0.0, 0.0, 0.0], [0.0, 0.0, 0.0], [0.0, 0.0, 0.0]])
saved_t = np.linspace(0,0)
saved_Ib = 0.0
saved_init = 0.0

import pickle

# Create a dictionary to store the data
settings = {
    'edge_detect_A': edge_detect_A,
    'edge_detect_B': edge_detect_B,
    'edge_detect_t': edge_detect_t,
    'edge_detect_Ib': edge_detect_Ib,
    'edge_detect_init': edge_detect_init,

    'grayscale_edge_detect_A': grayscale_edge_detect_A,
    'grayscale_edge_detect_B': grayscale_edge_detect_B,
    'grayscale_edge_detect_t': grayscale_edge_detect_t,
    'grayscale_edge_detect_Ib': grayscale_edge_detect_Ib,
    'grayscale_edge_detect_init': grayscale_edge_detect_init,

    'corner_detect_A': corner_detect_A,
    'corner_detect_B': corner_detect_B,
    'corner_detect_t': corner_detect_t,
    'corner_detect_Ib': corner_detect_Ib,
    'corner_detect_init': corner_detect_init,

    'diagonal_line_detect_A': diagonal_line_detect_A,
    'diagonal_line_detect_B': diagonal_line_detect_B,
    'diagonal_line_detect_t': diagonal_line_detect_t,
    'diagonal_line_detect_Ib': diagonal_line_detect_Ib,
    'diagonal_line_detect_init': diagonal_line_detect_init,

    'inversion_A': inversion_A,
    'inversion_B': inversion_B,
    'inversion_t': inversion_t,
    'inversion_Ib': inversion_Ib,
    'inversion_init': inversion_init,

    'optimal_edge_detect_A': optimal_edge_detect_A,
    'optimal_edge_detect_B': optimal_edge_detect_B,
    'optimal_edge_detect_t': optimal_edge_detect_t,
    'optimal_edge_detect_Ib': optimal_edge_detect_Ib,
    'optimal_edge_detect_init': optimal_edge_detect_init,

    'horizontal_line_detect_A': horizontal_line_detect_A,
    'horizontal_line_detect_B': horizontal_line_detect_B,
    'horizontal_line_detect_t': horizontal_line_detect_t,
    'horizontal_line_detect_Ib': horizontal_line_detect_Ib,
    'horizontal_line_detect_init': horizontal_line_detect_init,

    'vertical_line_detect_A': vertical_line_detect_A,
    'vertical_line_detect_B': vertical_line_detect_B,
    'vertical_line_detect_t': vertical_line_detect_t,
    'vertical_line_detect_Ib': vertical_line_detect_Ib,
    'vertical_line_detect_init': vertical_line_detect_init,

    'noise_removal_A': noise_removal_A,
    'noise_removal_B': noise_removal_B,
    'noise_removal_t': noise_removal_t,
    'noise_removal_Ib': noise_removal_Ib,
    'noise_removal_init': noise_removal_init,

    'shadow_detect_A': shadow_detect_A,
    'shadow_detect_B': shadow_detect_B,
    'shadow_detect_t': shadow_detect_t,
    'shadow_detect_Ib': shadow_detect_Ib,
    'shadow_detect_init': shadow_detect_init,

    'connected_comp_A': connected_comp_A,
    'connected_comp_B': connected_comp_B,
    'connected_comp_t': connected_comp_t,
    'connected_comp_Ib': connected_comp_Ib,
    'connected_comp_init': connected_comp_init,

    'saved_A': saved_A,
    'saved_B': saved_B,
    'saved_t': saved_t,
    'saved_Ib': saved_Ib,
    'saved_init': saved_init
}

# Save the data to a file using pickle
with open('settings.pkl', 'wb') as f:
    pickle.dump(settings, f)
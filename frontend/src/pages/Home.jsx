import { createComponent, createSignal } from 'solid-js';

function Navbar() {
  return (
    <nav class="flex justify-between items-center py-4">
      <ul class="flex items-center">
        <li class="mr-4">
          <a href="/photocnn" class="text-gray-600 hover:text-gray-900">Photo CNN</a>
        </li>
        <li class="mr-4">
          <a href="/videocnn" class="text-gray-600 hover:text-gray-900">VideoCNN</a>
        </li>
        <li>
          <a href="/stx" class="text-gray-600 hover:text-gray-900">Set parameters</a>
        </li>
      </ul>
    </nav>
  );
}

function Home() {
  const [date, setDate] = createSignal(new Date('2024-09-03T00:00:00.000Z'));

  return (
    <div class="container mx-auto p-4 pt-6 md:p-6 lg:p-12" style={{ "background-color": '#f0f0f0' }}>
      <Navbar />
      <h1 class="text-3xl font-bold mb-4">Cellular Neural Network</h1>
      <p class="text-lg mb-8">A cellular neural network (CNN) is a type of neural network that is inspired by the structure and function of the brain.</p>
      <p class="text-lg mb-8">Today is {date().toLocaleDateString()}</p>
      <h2 class="text-2xl font-bold mb-4">What is a Cellular Neural Network?</h2>
      <p class="text-lg mb-8">A cellular neural network is a type of neural network that is composed of a grid of interconnected cells, or neurons. Each cell receives one or more inputs, performs a computation on those inputs, and then sends the output to other cells.</p>
      <h2 class="text-2xl font-bold mb-4">How Does it Work?</h2>
      <p class="text-lg mb-8">The cells in a cellular neural network are arranged in a grid, and each cell is connected to its neighbors. The cells receive inputs from their neighbors, perform a computation on those inputs, and then send the output to other cells.</p>
      <h2 class="text-2xl font-bold mb-4">Applications</h2>
      <ul class="list-disc pl-4 mb-8">
        <li>Image processing</li>
        <li>Pattern recognition</li>
        <li>Optimization problems</li>
      </ul>
    </div>
  );
}

export default Home;
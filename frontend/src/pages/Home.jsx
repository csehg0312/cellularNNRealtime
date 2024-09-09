import { createComponent, createSignal } from 'solid-js';

// function useDarkMode() {
//   const [isDarkMode, setIsDarkMode] = createSignal(window.matchMedia('(prefers-color-scheme: dark)').matches);

//   // Update the dark mode signal when the user changes their preference
//   window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
//     setIsDarkMode(e.matches);
//   });

//   return isDarkMode;
// }

// function Navbar({ isDarkMode }) {
//   return (
//     <nav class={`py-4 ${isDarkMode ? 'bg-gray-800 text-white shadow-md' : 'bg-white text-gray-800 border border-gray-200 shadow-sm'}`}>
//       <div class="container mx-auto flex justify-between items-center px-4">
//         <ul class="flex space-x-4">
//           <li>
//             <a
//               href="/photocnn"
//               class={`border-b-2 pb-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-orange-500 border-transparent hover:border-orange-500' : 'text-gray-800 hover:text-orange-600 border-gray-300 hover:border-orange-600'}`}
//             >
//               Photo CNN
//             </a>
//           </li>
//           <li>
//             <a
//               href="/videocnn"
//               class={`border-b-2 pb-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-orange-500 border-transparent hover:border-orange-500' : 'text-gray-800 hover:text-orange-600 border-gray-300 hover:border-orange-600'}`}
//             >
//               VideoCNN
//             </a>
//           </li>
//           <li>
//             <a
//               href="/stx"
//               class={`border-b-2 pb-2 transition-colors ${isDarkMode ? 'text-gray-300 hover:text-orange-500 border-transparent hover:border-orange-500' : 'text-gray-800 hover:text-orange-600 border-gray-300 hover:border-orange-600'}`}
//             >
//               Set parameters
//             </a>
//           </li>
//         </ul>
//       </div>
//     </nav>
//   );
// }

function Navbar() {
  return (
    <nav class="py-4 bg-white text-black border border-gray-200 shadow-sm">
      <div class="container mx-auto flex justify-between items-center px-4">
        <ul class="flex space-x-4">
          <li>
            <a
              href="/photocnn"
              class="border-b-2 pb-2 transition-colors text-black hover:text-orange-600 border-gray-300 hover:border-orange-600"
            >
              Photo CNN
            </a>
          </li>
          <li>
            <a
              href="/videocnn"
              class="border-b-2 pb-2 transition-colors text-black hover:text-orange-600 border-gray-300 hover:border-orange-600"
            >
              VideoCNN
            </a>
          </li>
          <li>
            <a
              href="/stx"
              class="border-b-2 pb-2 transition-colors text-black hover:text-orange-600 border-gray-300 hover:border-orange-600"
            >
              Set parameters
            </a>
          </li>
        </ul>
      </div>
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
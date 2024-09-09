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
      <h1 class="text-3xl font-bold mb-4">Mi az a celluláris neurális hálózat?</h1>
      <p class="text-lg mb-8">A celluláris neurális hálózat (CNN) egy speciális típusú neurális hálózat, amely az emberi agy struktúráját és működését mintázza. A hagyományos neurális hálózatokkal ellentétben, amelyek rétegekben vannak szervezve, a CNN egy összekapcsolt sejtekből álló rácsot alkot, ahol minden sejt hasonlóan működik, mint az agyban lévő neuron.</p>
      
      <h2 class="text-2xl font-bold mb-4">Hogyan Működik?</h2>
      <p class="text-lg mb-8">A celluláris neurális hálózatban a sejtek két dimenziós rácsban vagy hálózatban vannak elrendezve. Minden sejt kölcsönhatásba lép közvetlen szomszédaival. Az alábbi lépéseket követi:</p>
      <ul class="list-disc pl-4 mb-8">
        <li>
          <h2 class="text-2xl font-bold mb-4">Bemeneti Adatok Fogadása</h2>
          <p class="text-lg mb-8" >Minden sejt azonnal szomszédaitól kap bemenetet. Ezek a bemenetek szomszédos sejtektől származhatnak, vagy külső forrástól, ha a rács határfeltételekkel van kialakítva.</p>
        </li>
        <li>
          <h2 class="text-2xl font-bold mb-4">Számítás</h2>
          <p class="text-lg mb-8" >Minden sejt elvégez egy számítást a kapott bemenetek alapján. Ez a számítás általában bemenetek súlyozott összegeit tartalmazza, majd aktiváló függvény alkalmazásával meghatározza a kimenetet.</p>
        </li>
        <li>
          <h2 class="text-2xl font-bold mb-4">Kimenet Továbbítása</h2>
          <p class="text-lg mb-8" >Miután kiszámította a kimenetet, minden sejt továbbítja ezt a kimenetet szomszédos sejteinek. Ez a folyamat lehetővé teszi, hogy a hálózat információt terjesszen a rácson keresztül, és a helyi kölcsönhatások alapján alkalmazkodjon.</p>
        </li>
        <li>
          <h2 class="text-2xl font-bold mb-4">Visszacsatolás és Kiegyenlítés</h2>
          <p class='text-lg mb-8'>A hálózat tartalmazhat visszacsatolási mechanizmusokat, ahol a sejtek az általuk kapott kimenetek alapján módosítják viselkedésüket, lehetővé téve a hálózat számára, hogy alkalmazkodjon és finomítsa feldolgozását idővel.</p>
        </li>
      </ul>
      <h2 class="text-2xl font-bold mb-4">Alkalmazások: </h2>
      <p class='text-lg mb-8'>A celluláris neurális hálózatok különösen hasznosak olyan területeken, ahol a helyi kölcsönhatások és térbeli minták fontosak. Néhány gyakori alkalmazás:</p>
      <ul class="list-disc pl-4 mb-8">
        <li>
          <h2 class="text-2xl font-bold mb-4">Képkezelés</h2>
          <p class='text-lg mb-8'>A CNN-eket használhatják olyan feladatokhoz, mint a szélvédő-érzékelés, zajcsökkentés és képjavítás, kihasználva a helyi minták feldolgozásának képességét.</p>
        </li>
        <li>
          <h2 class="text-2xl font-bold mb-4">Minta felismerés</h2>
          <p class='text-lg mb-8'>A CNN-eket használhatják olyan feladatokhoz, mint a szélvédő-érzékelés, zajcsökkentés és képjavítás, kihasználva a helyi minták feldolgozásának képességét.</p>
        </li>
        <li>
          <h2 class="text-2xl font-bold mb-4">Optimalizálási problémák</h2>
          <p class='text-lg mb-8'>A CNN-ek alkalmazhatók olyan optimalizálási problémákra, ahol a térbeli kapcsolatok és helyi kölcsönhatások kulcsszerepet játszanak, például ütemezésben vagy erőforrás-elosztásban.</p>
        </li>
      </ul>

    </div>
  );
}

export default Home;
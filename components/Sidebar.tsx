import Link from "next/link";


function SideBar() {
  return (
    <div className="font-albert flex h-screen text-white">
      <div className="w-64 bg-black p-4 flex flex-col justify-between">
        <div>
          <Link href="/Home" className="text-4xl font-bold text-green-400 mb-8 block text-center transform translate-y-4">
            XURP IA
          </Link>
          <div className="side-nav mb-10">
            <div className="INICIO mt-36">
              <Link href="/Home" className="flex items-center py-2 px-4 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="35"
                  height="35"
                  viewBox="-20 50 300 150"
                  className="fill-white mr-4"
                >
                  <g fill="#ffffff" fillRule="nonzero" stroke="none" strokeWidth="1">
                    <g transform="scale(5.33333, 5.33333)">
                      <path d="M23.95117,4c-0.31984,0.01092 -0.62781,0.12384 -0.87891,0.32227l-14.21289,11.19727c-1.8039,1.42163 -2.85937,3.59398 -2.85937,5.89063v19.08984c0,1.36359 1.13641,2.5 2.5,2.5h10c1.36359,0 2.5,-1.13641 2.5,-2.5v-10c0,-0.29504 0.20496,-0.5 0.5,-0.5h5c0.29504,0 0.5,0.20496 0.5,0.5v10c0,1.36359 1.13641,2.5 2.5,2.5h10c1.36359,0 2.5,-1.13641 2.5,-2.5v-19.08984c0,-2.29665 -1.05548,-4.46899 -2.85937,-5.89062l-14.21289,-11.19727c-0.27738,-0.21912 -0.62324,-0.33326 -0.97656,-0.32227zM24,7.41016l13.28516,10.4668c1.0841,0.85437 1.71484,2.15385 1.71484,3.5332v18.58984h-9v-9.5c0,-1.91495 -1.58505,-3.5 -3.5,-3.5h-5c-1.91495,0 -3.5,1.58505 -3.5,3.5v9.5h-9v-18.58984c0,-1.37935 0.63074,-2.67883 1.71484,-3.5332z" />
                    </g>
                  </g>
                </svg>
                Inicio
              </Link>
            </div>

            <div className="NOTAS mt-3 mb-4">
              <Link href="/Notes" className="flex items-center py-2 px-4 rounded">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="35"
                  height="35"
                  viewBox="0 0 50 50"
                  className="fill-white mr-4"
                >
                  <path d="M 14 4 C 8.4886661 4 4 8.4886661 4 14 L 4 36 C 4 41.511334 8.4886661 46 14 46 L 36 46 C 41.511334 46 46 41.511334 46 36 L 46 14 C 46 8.4886661 41.511334 4 36 4 L 14 4 z M 14 6 L 36 6 C 40.430666 6 44 9.5693339 44 14 L 44 16 L 6 16 L 6 14 C 6 9.5693339 9.5693339 6 14 6 z M 6 18 L 44 18 L 44 26 L 6 26 L 6 18 z M 8 20 L 8 22 L 10 22 L 10 20 L 8 20 z M 12 20 L 12 22 L 14 22 L 14 20 L 12 20 z M 16 20 L 16 22 L 18 22 L 18 20 L 16 20 z" />
                </svg>
                Notas
              </Link>
            </div>

            <div className="More mb-8 ml-5 flex items-center">
              <Link href="/More" className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="35"
                  height="35"
                  viewBox="0 0 40 35"
                  className="fill-white mr-4" // Añadir margen derecho para separación
                >
                  <path d="M 4 7 L 4 9 L 28 9 L 28 7 Z M 4 15 L 4 17 L 28 17 L 28 15 Z M 4 23 L 4 25 L 28 25 L 28 23 Z" />
                </svg>
                Más
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SideBar;
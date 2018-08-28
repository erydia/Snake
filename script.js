document.addEventListener('DOMContentLoaded', () => {

    // Pobieranie elementu reprezentującego wynik z drzewa DOM. 
    const boardEl = document.querySelector('.board');
    const loseScreenEl = document.querySelector('.lose-screen')

    // Zmienne przechowujące pozycje X jak i Y.
    const positionX = 20;
    const positionY = 20;
    // Pusta tablica na kafelki jakie będą na planszy.
    let arrayTiles = [];
    // Tablica która zawiera możliwe kierunki ruchu.
    let directionsMovements = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
    // Zmienna, która zwiera aktualny kierunek ruchu.
    let direction = 'ArrowLeft';
    // Aktualna pozycja węża na siatce względem osi X jak i Y.
    let positionXSnake = 4;
    let positionYSnake = 8;
    // Zmienna przechowująca informacje czy gra jeszcze trwa.
    //let isGameLost = false;

    // Stworzenie dwuwymiarowej tablicy - 20x20
    for (let i = 0; i < positionY; i++) {
        arrayTiles[i] = [];
    };
    for (let y = 0; y < positionX; ++y ){
        for (let x = 0; x < positionY; ++x ) {
            // Stworzenie dynamicznie diva który będzie kafelkiem, wystylizowanie go.
            let tile = document.createElement('div');
            tile.classList.add('tile-board');
            //tile.innerText = `${x},${y}`
            // Dodanie kafelka do htmla. 
            boardEl.appendChild(tile);
            // Wypełnienie tablicy stworzonymi divami.
            arrayTiles[x][y] = tile;
        };
    };

    // Funkcja, która wyświetla węża w htmlu.
    const updateSnake = () => {
        // Dodanie klasy stylizującej węża do każego elementu (diva).
        snake.forEach(el => el.classList.add('part-of-the-snake'));
        // Usunięcie klasy stylizującej węża z ostatniego elementu tablicy.
        let lenghtSnake = snake.length;
        snake[lenghtSnake-1].classList.remove('part-of-the-snake');
        // Usunięcie ostatniego elementu z tablicy.
        snake.splice(lenghtSnake-1, 1); 
    }

    // Funkcja, która blokuje przeciwny ruch do wybranego (gdy wąż rusza się w prawo, nie możemy wykonać ruchu w lewo).
    const checkingTheDirection = () => {
        // Aktualizacja tablicy.
        directionsMovements = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
        // Usunięcie z tablicy ruchu przeciwnego do ruchu w góre.
        if (direction === 'ArrowUp') {
            let index = directionsMovements.indexOf('ArrowDown');
            directionsMovements.splice(index, 1);
        // Usunięcie z tablicy ruchu przeciwnego do ruchu w dół.    
        } else if (direction === 'ArrowDown') {
            let index = directionsMovements.indexOf('ArrowUp');
            directionsMovements.splice(index, 1);
         // Usunięcie z tablicy ruchu przeciwnego do ruchu w lewo.    
        } else if (direction === 'ArrowLeft') {
            let index = directionsMovements.indexOf('ArrowRight');
            directionsMovements.splice(index, 1);
        // Usunięcie z tablicy ruchu przeciwnego do ruchu w prawo.
        } else if (direction === 'ArrowRight') {
            let index = directionsMovements.indexOf('ArrowLeft');
            directionsMovements.splice(index, 1);
        };
    };

    // Tablica która przechowuje kafelki na których wąż się znajduje.
    let snake = [ arrayTiles[4][8], arrayTiles[5][8], arrayTiles[6][8], arrayTiles[7][8], arrayTiles[8][8], arrayTiles[9][8], arrayTiles[10][8], arrayTiles[11][8] ];
    // Wyświetlenie węża w htmlu.
    updateSnake();
   
    // Nasłuchiwanie na zmiane kierunku. 
    document.addEventListener('keyup', (event) => {
        // Przypisanie do zmiennej kierunku jeśli jest zgodny z tablicą możliwych kierunków.
        if (event.key === directionsMovements.find((el) => el === event.key)) {
            direction = event.key;
        };
    });

    // Funkcja która sprawdza czy wąż nie uderzył w krawędź planszy.
    const checkingTheEdgeOfTheBoard = (position) => {
        // Jeśli pozycja węża wyjdzie poza plansze gra zostaje przerwana.
        if( position < 0 || position > 19  ) {
            loseGame()
        }
    }

    // Funkcja która sprawdza czy wąż się nie zaplątał.
    const checkingMoveSnake = (x, y) => {
        // Sprawdzenie czy pola na których jest wąż pokrywają się z polem jakie wąż zamierza teraz odwiedzić.
        let thisHit = snake.find((el) => el === arrayTiles[x][y]);
        // Jeśli wąż trafił w siebie gra zostaje przerwana.
        if(thisHit !== undefined) {
            loseGame();
        };
    };

    //Funkcja obsługująca przegraną gracza.
    const loseGame = () => {
        //isGameLost = true;
        // Dodanie przeźroczystości planszy.
        boardEl.classList.add('is-transparent');
        // Wyświetlenie informacji o przegranej w htmlu.
        loseScreenEl.innerText = 'Przegrałeś';
        // Przerwanie ruchu węża.
        clearInterval(snakeMove);   
    };

    // Obsługa ruchu węża. 
    const snakeMove = setInterval( () => {
        // Dostosowanie tablicy możliwych kierunków.
        checkingTheDirection();
        // RUCH W LEWO.
        if(direction === 'ArrowLeft') {
            // Zmniejszenie pozycji na osi X.
            positionXSnake -= 1;
            // Sprawdzenie czy wąż nie uderza w krawędź.
            checkingTheEdgeOfTheBoard(positionXSnake);
            // Sprawdzenie czy wąż nie uderza w siebie.
            checkingMoveSnake(positionXSnake, positionYSnake);
            // Dodanie nowego elementu węża na początek tablicy.  
            snake.unshift(arrayTiles[positionXSnake][positionYSnake]);
        // RUCH W PRAWO.
        } else if (direction === 'ArrowRight') {
            // Zwiększenie pozycji na osi X.
            positionXSnake += 1;
            // Sprawdzenie czy wąż nie uderza w krawędź.
            checkingTheEdgeOfTheBoard(positionXSnake);
            // Sprawdzenie czy wąż nie uderza w siebie.
            checkingMoveSnake(positionXSnake, positionYSnake);
            // Dodanie nowego elementu węża na początek tablicy.    
            snake.unshift(arrayTiles[positionXSnake][positionYSnake]);
        // RUCH W GÓRE.
        } else if (direction === 'ArrowUp') {
            // Zmniejszenie pozycji na osi Y.
            positionYSnake -= 1;
            // Sprawdzenie czy wąż nie uderza w krawędź.
            checkingTheEdgeOfTheBoard(positionYSnake);
            // Sprawdzenie czy wąż nie uderza w siebie.
            checkingMoveSnake(positionXSnake, positionYSnake);  
            // Dodanie nowego elementu węża na początek tablicy. 
            snake.unshift(arrayTiles[positionXSnake][positionYSnake]);
        // RUCH W DÓŁ.    
        } else if (direction === 'ArrowDown') {
            // Zwiększenie pozycji na osi Y.
            positionYSnake += 1;
            // Sprawdzenie czy wąż nie uderza w krawędź.
            checkingTheEdgeOfTheBoard(positionYSnake);
            // Sprawdzenie czy wąż nie uderza w siebie.
            checkingMoveSnake(positionXSnake, positionYSnake);
            // Dodanie nowego elementu węża na początek tablicy.   
            snake.unshift(arrayTiles[positionXSnake][positionYSnake]);
        }
        // Aktualzacja pozycji i wyglądu węża w htmlu.
        updateSnake();
    }, 1000);

});
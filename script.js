document.addEventListener('DOMContentLoaded', () => {

    // Pobieranie elementów reprezentujących wyniki z drzewa DOM. 
    const boardEl = document.querySelector('.board');
    const loseScreenEl = document.querySelector('.lose-screen');
    const pointEl = document.querySelector('.point');
    const startEl = document.querySelector('.start');
    const pauseEl = document.querySelector('.pause');

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
    let snakePositionX = 4;
    let snakePositionY = 8;
    // Zmienna która zawiera pozycje wyświetlonego punktu na planszy.
    let elementPosition = ''
    // Zmienna która zwiera informacje o tym czy punkt jest już wyświetlony na planszy; domyślnie - false.
    let thePointInBoard = false;
    // Zmienna zawierająca informacje o ilości punktów.
    let point = 0;
    // Wyświetlenie punktów w htmlu.
    pointEl.innerText = `Punkty: ${point}`;
    // Zmienna przechowuje informacje o tym czy gra się już rozpoczeła.
    let gameIsStarted = false;
    // Zmienna przechowuje informacje czy jest włączona pauza.
    let pause = false;

    // Stworzenie dwuwymiarowej tablicy - 20x20
    for (let i = 0; i < positionY; i++) {
        arrayTiles[i] = [];
    };
    for (let y = 0; y < positionX; ++y) {
        for (let x = 0; x < positionY; ++x ) {
            // Stworzenie dynamicznie diva który będzie kafelkiem, wystylizowanie go.
            let tile = document.createElement('div');
            tile.classList.add('tile-board');
            // Dodanie kafelka do htmla. 
            boardEl.appendChild(tile);
            // Wypełnienie tablicy stworzonymi divami.
            arrayTiles[x][y] = tile;
        };
    };

    // Funkcja która wyświetla węża na planszy.
    const displaySnake = () => {
        // Dodanie do elementów węża klasy która stylizuje węża.
        snake.forEach(el => el.classList.add('part-of-the-snake'));
    };

    // Funkcja, która aktualizuje długość węża przy ruchu.
    const updateLenghtSnake = () => {
        // Usunięcie klasy stylizującej węża z ostatniego elementu tablicy.
        let lenghtSnake = snake.length;
        snake[lenghtSnake-1].classList.remove('part-of-the-snake');
        // Usunięcie ostatniego elementu z tablicy.
        snake.splice(lenghtSnake-1, 1); 
    };

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
    let snake = [arrayTiles[4][8], arrayTiles[5][8], arrayTiles[6][8], arrayTiles[7][8], arrayTiles[8][8], arrayTiles[9][8], arrayTiles[10][8], arrayTiles[11][8]];
    // Wyświetlenie węża na planszy.
    displaySnake();

    // Nasłuchiwanie na zmiane kierunku. 
    document.addEventListener('keyup', (event) => {
        // Przypisanie do zmiennej kierunku jeśli jest zgodny z tablicą możliwych kierunków.
        if (event.key === directionsMovements.find((el) => el === event.key)) {
            direction = event.key;
        };
    });

    // Funkcja która losuje pozycje punktu i wyświetla go na planszy.
    const displayPointElement = () => {
        // Punkt został wyświetlony - zmianna zmiennej na true.
        thePointInBoard = true;
        // Zmienna która trzyma odpowiednie wyrażenie do losowania pozycji.
        const randomPosition = Math.floor(Math.random() * 19);
        // Losowanie pozycji na osi x punktu.
        let elementPositionX = randomPosition;
        // Losowanie pozycji na osi y punktu.
        let elementPositionY = randomPosition;
        // Przypisanie do zmiennej kafelka z wylosowaną pozycją.
        elementPosition = arrayTiles[elementPositionX][elementPositionY]
        // Sprawdzenie czy punkt nie znajduję się na kafelku zajmowanym przez węża.
        let thePosition = snake.find((el) => el === elementPosition);
        // Jeśli punkt ma tą samą pozycje co element węża - nie wyświetlaj go.
        if (thePosition !== undefined) {
            // Punkt nie ma wyznaczonej pozycji.
            elementPosition = '';
            // Punkt nie jest wyświetlony - zmiana zmiennej na false.
            thePointInBoard = false;
        // Jeśli punkt ma inną pozycje niż wąż - wyświetl go.    
        } else {  
            // Nadanie klasy sytlizującej punkt.   
            elementPosition.classList.add('point-element');
        };
    };

    // Funkcja która sprawdza czy punkt został zjedzony przez węża.
    const checkingPointElement = () => {
        // Sprawdzenie czy wąż znajduję się na tej samej pozycji co punkt.
        let thisPoint = snake.find((el) => el === elementPosition);
        // Jeśli tak - gracz dostaje punkt, wąż powiększa się a element zostaje usunięty z planszy.
        if (thisPoint !== undefined) {
            // Usunięcie klasy stylizujacej punkt.
            elementPosition.classList.remove('point-element');
            // Dodanie zjedzonego elementu do tablicy z wężem.
            snake.push(elementPosition);
            // Pozozycja punktu resetuje się.
            elementPosition = '';
            // Dodanie punktu do puli.
            point += 1;
            // Wyświetlenie punktów w htmlu.
            pointEl.innerText = `Punkty: ${point}`;
            // Punkt nie jest już wyświetlony - zmiana zmiennej na false.
            thePointInBoard = false;      
        };    
    };

    // Funkcja która sprawdza czy wąż nie uderzył w krawędź planszy.
    const checkingTheEdgeOfTheBoard = (position) => {
        // Jeśli pozycja węża wyjdzie poza plansze gra zostaje przerwana.
        if (position < 0 || position > 19) {
            loseGame();
        };
    };

    // Funkcja która sprawdza czy wąż się nie zaplątał.
    const checkingMoveSnake = (x, y) => {
        // Sprawdzenie czy pola na których jest wąż pokrywają się z polem jakie wąż zamierza teraz odwiedzić.
        let thisHit = snake.find((el) => el === arrayTiles[x][y]);
        // Jeśli wąż trafił w siebie gra zostaje przerwana.
        if (thisHit !== undefined) {
            loseGame();
        };
    };

    //Funkcja obsługująca przegraną gracza.
    const loseGame = () => {
        //isGameLost = true;
        // Dodanie przeźroczystości planszy.
        boardEl.classList.add('is-transparent');
        // Wyświetlenie informacji o przegranej w htmlu.
        loseScreenEl.innerText = 'Przegrałeś :(';
        // Przerwanie ruchu węża.
        clearInterval(snakeMovement);
        // Przerwanie wyświetlania punktów na planszy. 
        clearInterval(drawingPointElementInHtml);
        // Przerwanie aktualizowania wyglądu węża na planszy. 
        clearInterval(drawingSnakeInHtml);
    };

    // Obsługa ruchu węża. 
    const snakeMovement = setInterval( () => {
        if (gameIsStarted && !pause) {
            // Dostosowanie tablicy możliwych kierunków.
            checkingTheDirection();
            
            // RUCH W LEWO.
            if (direction === 'ArrowLeft') {
                // Zmniejszenie pozycji na osi X.
                snakePositionX -= 1;
                // Sprawdzenie czy wąż nie uderza w krawędź.
                checkingTheEdgeOfTheBoard(snakePositionX);
                // Sprawdzenie czy wąż nie uderza w siebie.
                checkingMoveSnake(snakePositionX, snakePositionY);
                // Dodanie nowego elementu węża na początek tablicy.  
                snake.unshift(arrayTiles[snakePositionX][snakePositionY]);

            // RUCH W PRAWO.
            } else if (direction === 'ArrowRight') {
                // Zwiększenie pozycji na osi X.
                snakePositionX += 1;
                // Sprawdzenie czy wąż nie uderza w krawędź.
                checkingTheEdgeOfTheBoard(snakePositionX);
                // Sprawdzenie czy wąż nie uderza w siebie.
                checkingMoveSnake(snakePositionX, snakePositionY);
                // Dodanie nowego elementu węża na początek tablicy.    
                snake.unshift(arrayTiles[snakePositionX][snakePositionY]);
            
                // RUCH W GÓRE.
            } else if (direction === 'ArrowUp') {
                // Zmniejszenie pozycji na osi Y.
                snakePositionY -= 1;
                // Sprawdzenie czy wąż nie uderza w krawędź.
                checkingTheEdgeOfTheBoard(snakePositionY);
                // Sprawdzenie czy wąż nie uderza w siebie.
                checkingMoveSnake(snakePositionX, snakePositionY);  
                // Dodanie nowego elementu węża na początek tablicy. 
                snake.unshift(arrayTiles[snakePositionX][snakePositionY]);
            
                // RUCH W DÓŁ.    
            } else if (direction === 'ArrowDown') {
                // Zwiększenie pozycji na osi Y.
                snakePositionY += 1;
                // Sprawdzenie czy wąż nie uderza w krawędź.
                checkingTheEdgeOfTheBoard(snakePositionY);
                // Sprawdzenie czy wąż nie uderza w siebie.
                checkingMoveSnake(snakePositionX, snakePositionY);
                // Dodanie nowego elementu węża na początek tablicy.   
                snake.unshift(arrayTiles[snakePositionX][snakePositionY]);
            };

            // Aktualzacja długości węża przy zmianie pozycji.
            updateLenghtSnake();
            // Sprawdzanie czy punkt został zjedzony.
            checkingPointElement();
        };    
    }, 300);

    // Wyświetlanie punktów na planszy.
    const drawingPointElementInHtml = setInterval( () => {
        if (!thePointInBoard && gameIsStarted && !pause) {
            displayPointElement();
        };
    } ,100);

    // Aktualizowanie wyglądu węza na planszy.
    const drawingSnakeInHtml = setInterval( () => {
        if (gameIsStarted && !pause) {   
            displaySnake();
        }    
    }, 100);

    // Rozpoczęcie gry!
    startEl.addEventListener('click', () => gameIsStarted =  true );
   
    // Zpauzowanie gry.
    pauseEl.addEventListener('click', () => {   
        // Blokada gry.
        if (!pause) {       
            pause = true;
            pauseEl.innerText = 'Wznów';
            boardEl.classList.add('is-transparent');
        // Wznowienie gry.
        } else {
            pause = false;
            pauseEl.innerText = 'Pauza';
            boardEl.classList.remove('is-transparent');
        };
        return pause;
    });


});
document.addEventListener('DOMContentLoaded', () => {

    // Pobieranie elementów reprezentujących wyniki z drzewa DOM. 
    const boardEl = document.querySelector('.board');
    const loseScreenEl = document.querySelector('.lose-screen');
    const pointEl = document.querySelector('.point');
    const startEl = document.querySelector('.start');
    const pauseEl = document.querySelector('.pause');

    // Zmienne trzymające intervale (ruch węża i aktualizacja jego wyglądu w htmlu, wyświetlanie się puntków).
    let snakeMovementInterval;
    let drawingPointElementInHtmlInterval;
    let drawingSnakeInHtmlInterval;

    // Zmienne przechowujące pozycje X jak i Y.
    const boardSize = 20;
    // Pusta tablica na kafelki jakie będą na planszy.
    const arrayTiles = [];

    // Tablica która zawiera możliwe kierunki ruchu.
    let directionsMovements = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft'];
    // Zmienna, która zwiera aktualny kierunek ruchu.
    let direction;
    // Tablica zawierająca informacje dotyczące każdego kierunku (oś, współczynnki, klawisz).
    const directionArray = [{
        key: 'ArrowLeft',
        factor: 'minus',
        axis: 'x',
    },{
        key: 'ArrowRight',
        factor: 'plus',
        axis: 'x',
    },{
        key: 'ArrowUp',
        factor: 'minus',
        axis: 'y',
    },{
        key: 'ArrowDown',
        factor: 'plus',
        axis: 'y',
    },];

    // Aktualna pozycja węża na siatce względem osi X jak i Y.
    let snakePositionX;
    let snakePositionY;
    // Zmienna która zawiera pozycje wyświetlonego punktu na planszy.
    let elementPosition;
    // Zmienna która zwiera informacje o tym czy punkt jest już wyświetlony na planszy; domyślnie - false.
    let thePointInBoard = false;
    // Zmienna która zawiera informacje o tym czy punkt został zjedzony.
    let thePointIsEaten = false;
    // Zmienna zawierająca informacje o ilości punktów.
    let point = 0;
    // Wyświetlenie punktów w htmlu.
    pointEl.innerText = `Punkty: ${point}`;
    // Zmienna przechowuje informacje o tym czy gra się już rozpoczeła.
    let gameIsStarted = false;
    // Zmienna przechowuje informacje czy jest włączona pauza.
    let pause = false;
    // Zmienna która przechowuje informacje o tym czy gra jest przegrana.
    let theGameIsLost = false;
    // Zmienna która przechowuje informacje o szybkości węża.
    let snakeSpeed;

    // Stworzenie dwuwymiarowej tablicy - 20x20.
    for (let i = 0; i < boardSize; i++) {
        arrayTiles[i] = [];
    };
    
    for (let y = 0; y < boardSize; ++y) {
        for (let x = 0; x < boardSize; ++x ) {
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
        if (!theGameIsLost) {
            // Wyczyszczenie planszy ze zbędnych klas.
            boardCleaning();

            // Zmienne pomocniczne trzymające elementy węża do porównywania.
            let oldElementIndex;
            let currentElementIndex;
            let newElemenetIndex;
            
            // Porównywanie elementów węża oraz nadawanie im odpowiedniej stylistyki po spełnieniu warunków.
            for (let i = 0; i < snake.length; i++) {
                oldElementIndex = snake[i-1];
                currentElementIndex = snake[i];
                newElemenetIndex = snake[i+1];
                if (oldElementIndex === undefined && currentElementIndex.x < newElemenetIndex.x) {
                    currentElementIndex.div.classList.add('snake-head');
                    currentElementIndex.div.classList.add('direction-left');
                } else if (oldElementIndex === undefined && currentElementIndex.x > newElemenetIndex.x) {
                    currentElementIndex.div.classList.add('snake-head');
                    currentElementIndex.div.classList.add('direction-right');
                } else if (oldElementIndex === undefined && currentElementIndex.y < newElemenetIndex.y) {
                    currentElementIndex.div.classList.add('snake-head');
                    currentElementIndex.div.classList.add('direction-up');
                } else if (oldElementIndex === undefined && currentElementIndex.y > newElemenetIndex.y) {
                    currentElementIndex.div.classList.add('snake-head');
                    currentElementIndex.div.classList.add('direction-down');
                } else if (oldElementIndex.x < currentElementIndex.x && newElemenetIndex === undefined) {
                    currentElementIndex.div.classList.add('snake-tail');
                    currentElementIndex.div.classList.add('direction-left');
                } else if (oldElementIndex.x > currentElementIndex.x && newElemenetIndex === undefined) {
                    currentElementIndex.div.classList.add('snake-tail');
                    currentElementIndex.div.classList.add('direction-right');
                } else if (oldElementIndex.y < currentElementIndex.y && newElemenetIndex === undefined) {
                    currentElementIndex.div.classList.add('snake-tail');
                    currentElementIndex.div.classList.add('direction-up');
                } else if (oldElementIndex.y > currentElementIndex.y && newElemenetIndex === undefined) {
                    currentElementIndex.div.classList.add('snake-tail');
                    currentElementIndex.div.classList.add('direction-down');
                } else if (oldElementIndex.y < currentElementIndex.y && currentElementIndex.x < newElemenetIndex.x || oldElementIndex.x > currentElementIndex.x && currentElementIndex.y > newElemenetIndex.y) {
                    currentElementIndex.div.classList.add('snake-edge');
                    currentElementIndex.div.classList.add('direction-up');
                } else if (oldElementIndex.y > currentElementIndex.y && currentElementIndex.x > newElemenetIndex.x || oldElementIndex.x < currentElementIndex.x && currentElementIndex.y < newElemenetIndex.y) {
                    currentElementIndex.div.classList.add('snake-edge');
                    currentElementIndex.div.classList.add('direction-down');
                } else if (oldElementIndex.x > currentElementIndex.x && currentElementIndex.y < newElemenetIndex.y || oldElementIndex.y > currentElementIndex.y && currentElementIndex.x < newElemenetIndex.x) {
                    currentElementIndex.div.classList.add('snake-edge');
                    currentElementIndex.div.classList.add('direction-right');
                } else if (oldElementIndex.x < currentElementIndex.x && currentElementIndex.y > newElemenetIndex.y || oldElementIndex.y < currentElementIndex.y && currentElementIndex.x > newElemenetIndex.x) {
                    currentElementIndex.div.classList.add('snake-edge');
                    currentElementIndex.div.classList.add('direction-left');
                } else if (oldElementIndex.x === currentElementIndex.x && currentElementIndex.x === newElemenetIndex.x && newElemenetIndex.x === oldElementIndex.x){
                    currentElementIndex.div.classList.add('snake-torso');
                    currentElementIndex.div.classList.add('direction-up');
                } else if (oldElementIndex.y === currentElementIndex.y && currentElementIndex.y === newElemenetIndex.y && newElemenetIndex.y === oldElementIndex.y) {
                    currentElementIndex.div.classList.add('snake-torso');
                    currentElementIndex.div.classList.add('direction-left');
                };   
            };
        };    
    };

    // Funkcja która usuwa wszystkie zbędne klasy z kafelków.
    const boardCleaning = () => {
        const tileBoardEl = document.querySelectorAll('.tile-board')
        tileBoardEl.forEach((el) => {
            // Przypisanie do zmiennej klas zawartych na danym kafelku
            let allClass = el.classList;
            // Usunięcie wszystkich zbędnych klas poza podstawową oraz klasą zawierającą punkt.
            for (let i = 1; i < allClass.length; i++) {
                if ( el.classList.item(i) !== 'point-element') {
                    el.classList.remove(el.classList.item(i));
                };
            };
        });
    };

    // Nasłuchiwanie na zmiane kierunku. 
    document.addEventListener('keyup', (event) => {
        // Przypisanie do zmiennej kierunku jeśli jest zgodny z tablicą możliwych kierunków.
        if (event.key === directionsMovements.find((el) => el === event.key)) {
            direction = event.key;
        };
    });

    const directionBlockMap = new Map();
    // Ustawiamy przeciwny kierunek dla każdej z wartości w mapie.
    directionBlockMap.set('ArrowUp', 'ArrowDown');
    directionBlockMap.set('ArrowDown', 'ArrowUp');
    directionBlockMap.set('ArrowLeft', 'ArrowRight');
    directionBlockMap.set('ArrowRight', 'ArrowLeft');

    // Funkcja, która blokuje przeciwny ruch do wybranego (gdy wąż rusza się w prawo, nie możemy wykonać ruchu w lewo).
    const checkingTheDirection = () => {
        // Aktualizacja tablicy.
        directionsMovements = ['ArrowUp', 'ArrowDown', 'ArrowRight', 'ArrowLeft']; 
        // Pobieramy przeciwny kierunek do obecnego.
        const blockedDirection = directionBlockMap.get(direction);
        // Pobieramy index przeciwnego kierunku. 
        const forbiddenDirectionIndex = directionsMovements.indexOf(blockedDirection);
        // Usunięcie przeciwnego kierunku z tablicy możliwych kierunków.
        directionsMovements.splice(forbiddenDirectionIndex, 1);
    };

    // Funkcja która czyści plansze z punktów.
    const pointCleaning = () => {
        const tileBoardEl = document.querySelectorAll('.tile-board');
        tileBoardEl.forEach((el) => {
            el.classList.remove('point-element');
        }); 
        elementPosition = '';
    };

    // Tablica która przechowuje kafelki na których wąż się znajduje.
    let snake = [];
    // Ustanona długość węża.
    const initialSnakeLength = 6;
    
    // Funkcja która ustawia pozycje węża.
    const setSnakePosition = () => {
        // Wyzerowanie tablicy.
        snake = [];
        // Zmienne, które przechowują informacje o maksymalnej i minimalnej pozycji węża na planszy.
        const maxPosition = boardSize - initialSnakeLength;
        const minPosition = initialSnakeLength; 
        // Wylosowanie losowej pozycji węża.  
        snakePositionX = Math.floor(Math.random() * (maxPosition - minPosition + 1) + minPosition);
        snakePositionY = Math.floor(Math.random() * (maxPosition - minPosition + 1) + minPosition);
    
        //Wylosowanie liczby od 0 do 1.
        let randomNumber = Math.random();
        // 25% szansy na wylosowanie kierunku losowo.
        if (randomNumber < 0.25 ) {
            direction = 'ArrowLeft';
            for (let i = 0; i < initialSnakeLength; i++) {   
            const object = {x: snakePositionX + i, y:snakePositionY, div: arrayTiles[snakePositionX + i][snakePositionY] }     
            snake.push(object);
            };
        } else if (randomNumber > 0.25 && randomNumber < 0.5) {
            direction = 'ArrowUp';
            for (let i = 0; i < initialSnakeLength; i++) {
                const object = {x: snakePositionX, y:snakePositionY + i, div: arrayTiles[snakePositionX][snakePositionY + i] }     
                snake.push(object);
            };
        } else if (randomNumber > 0.5 && randomNumber < 0.75) {
            direction = 'ArrowDown';
            for (let i = 0; i < initialSnakeLength; i++) {
                const object = {x: snakePositionX, y:snakePositionY - i, div: arrayTiles[snakePositionX][snakePositionY - i] }     
                snake.push(object);
            };  
        } else if (randomNumber > 0.75) {
            direction = 'ArrowRight';
            for (let i = 0; i < initialSnakeLength; i++) {
                const object = {x: snakePositionX-i, y:snakePositionY, div: arrayTiles[snakePositionX -i][snakePositionY] }     
                snake.push(object);
            };     
        }; 
    }; 

    // Funkcja która losuje pozycje punktu i wyświetla go na planszy.
    const displayPointElement = () => {
        // Punkt został wyświetlony - zmianna zmiennej na true.
        thePointInBoard = true;
        thePointIsEaten = false;
        // Zmienna która trzyma odpowiednie wyrażenie do losowania pozycji.
        // Losowanie pozycji dla punktu na osi x jak i y.
        let elementPositionX = Math.floor(Math.random() * (boardSize - 1));
        let elementPositionY = Math.floor(Math.random() * (boardSize - 1));
        // Przypisanie do zmiennej kafelka z wylosowaną pozycją.
        elementPosition = arrayTiles[elementPositionX][elementPositionY];
        // Sprawdzenie czy punkt nie znajduję się na kafelku zajmowanym przez węża.
        let thePosition = snake.find((el) => el.div === elementPosition);
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
        let thisPoint = snake.find((el) => el.div === elementPosition);
        // Jeśli tak - gracz dostaje punkt, wąż powiększa się a element zostaje usunięty z planszy.
        if (thisPoint !== undefined) {
            // Usunięcie klasy stylizujacej punkt.
            elementPosition.classList.remove('point-element');
            // Punkt został zjedzony - zmiana zmiennej na true.
            thePointIsEaten = true;
            // Pozozycja punktu resetuje się.
            elementPosition = '';
            // Dodanie punktu do puli.
            point += 1;
            // Wyświetlenie punktów w htmlu.
            pointEl.innerText = `Punkty: ${point}`;
            // Punkt nie jest już wyświetlony - zmiana zmiennej na false.
            thePointInBoard = false;
            // Odświeżenie węża jeśli gra nie została przegrana.
            displaySnake();
        };    
    };

    // Funkcja która aktualizuje szybkość węża.
    const updateSnakeSpeed = () => {
        // Zwiększenie szybkości jeśli punkt został zjedzony.    
        if (thePointIsEaten) {
            if (snakeSpeed > 100) {
                snakeSpeed -= 2;
            } else if (snakeSpeed <= 100) {
                snakeSpeed -= 1;
            };
            // Wyczyszczenie intervali.
            clearInterval(snakeMovementInterval);
            clearInterval(drawingSnakeInHtmlInterval);
            // Zaktualizowanie wyglądu węża.
            displaySnake();
            // Wywołanie ponownie interwali już z nową szybkością.
            snakeMovementInterval = snakeMovement();
            drawingSnakeInHtmlInterval = drawingSnakeInHtml();
        };
    };

    // Funkcja która sprawdza czy wąż nie uderzył w krawędź planszy.
    const checkingTheEdgeOfTheBoard = (position) => {
        // Jeśli pozycja węża wyjdzie poza plansze gra zostaje przerwana.
        if (position < 0 || position > (boardSize - 1)) {
            loseGame();
        };
    };

    // Funkcja która sprawdza czy wąż się nie zaplątał.
    const checkingMoveSnake = (x, y) => {
        // Sprawdzenie czy pola na których jest wąż pokrywają się z polem jakie wąż zamierza teraz odwiedzić.
        let thisHit = snake.find((el) => el.div === arrayTiles[x][y]);
        // Jeśli wąż trafił w siebie gra zostaje przerwana.
        if (thisHit !== undefined) {
            loseGame();
        };
    };

    //Funkcja obsługująca przegraną gracza.
    const loseGame = () => {
        theGameIsLost = true;
        gameIsStarted = false;
        // Dodanie przeźroczystości planszy.
        boardEl.classList.add('is-transparent');
        // Wyświetlenie informacji o przegranej w htmlu.
        loseScreenEl.innerText = 'Przegrałeś :(';
        // Przerwanie ruchu węża.
        clearInterval(snakeMovementInterval);
        // Przerwanie wyświetlania punktów na planszy. 
        clearInterval(drawingPointElementInHtmlInterval);
        // Przerwanie aktualizowania wyglądu węża na planszy. 
        clearInterval(drawingSnakeInHtmlInterval);
    };

    // Ruch węża.
    const movements = () => {
        // Wybranie obiektu z tablicy kierunków zgodnego z wybranym kierunkiem przez gracza.
        let theDirection = directionArray.find((el) => el.key === direction);
        // Aktualizacja pozycji węża.
        updatePosition(theDirection.axis, theDirection.factor);
        // Sprawdzenie czy wąż nie uderza w krawędź.
        checkingTheEdgeOfTheBoard(snakePositionX);
        checkingTheEdgeOfTheBoard(snakePositionY);
        // Sprawdzenie czy wąż nie uderza w siebie.
        checkingMoveSnake(snakePositionX, snakePositionY);
        // Dodanie nowego elementu węża na początek tablicy.
        const object = { x: snakePositionX, y: snakePositionY, div: arrayTiles[snakePositionX][snakePositionY] };     
        snake.unshift(object);
        // Odświeżenie węża jeśli gra nie została przegrana.
        displaySnake();
    }; 

    // Funkcja, która aktualizuje długość węża przy ruchu.
    const updateLenghtSnake = () => {
        // Odświeżenie węża jeśli gra nie została przegrana.
        displaySnake();
        if (!thePointIsEaten) {   
            // Usunięcie klasy stylizującej węża z ostatniego elementu tablicy.
            let lenghtSnake = snake.length;
            const lastElementIndex = lenghtSnake - 1;
            // Usunięcie ostatniego elementu z tablicy.
            snake.splice(lastElementIndex, 1);
            // Odświeżenie węża jeśli gra nie została przegrana.
            displaySnake();
        };   
    };

    // Akrualizacja pozycji węża.
    const updatePosition = (axis, factor ) => {
        // Dopasowanie odpowiedniej pozycji uwzględniając oś i czynnik. 
        if ( axis === 'x') {
            if (factor === 'minus') {
                snakePositionX -= 1;
            } else if (factor === 'plus') {
                snakePositionX += 1;
            };    
        } if (axis === 'y') {
            if (factor === 'minus') {
                snakePositionY -= 1;
            } else if (factor === 'plus') {
                snakePositionY += 1;
            };
        };                     
    };

    // Obsługa ruchu węża. 
    let snakeMovement = () => {
        return setInterval( () => {
            if (gameIsStarted && !pause) {  
                // Dostosowanie tablicy możliwych kierunków.
                checkingTheDirection();
                // Sprawdzanie czy punkt został zjedzony.
                checkingPointElement();
                updateSnakeSpeed();
                // Ruch węża zgodnie z wybranym kierunkiem.
                movements();
                // Aktualzacja długości węża przy zmianie pozycji.
                updateLenghtSnake();             
            };    
        }, snakeSpeed);
    };

    // Wyświetlanie punktów na planszy.
    const drawingPointElementInHtml = () => {
        return setInterval( () => {
            if (!thePointInBoard && gameIsStarted && !pause) {
                displayPointElement();
            };
        }, 100);
    };

    // Wyświetlanie węża na planszy.
    const drawingSnakeInHtml = () => {
        return setInterval(() => {
            if (gameIsStarted && !pause) {   
                displaySnake();
            };    
        }, snakeSpeed);
    };

    // Rozpoczęcie gry!
    const startGame = () => {
        // Zwróć funckje jeśli gra jest w trakcie.     
        if (gameIsStarted) {
            return;
        };
        // Ustawienie początkowych wartości zmiennych.
        gameIsStarted = true;
        theGameIsLost = false;
        point = 0;
        pointEl.innerText = `Punkty: ${point}`;
        thePointInBoard = false;    
        snakeSpeed = 200;

        // Wyczyszczenie planszy z wyświetlonego punktu.
        pointCleaning();
        // Ustawienie pozycji węża.
        setSnakePosition();
        
        // Odpalenie intervali - ruch węża i aktualizacja go, wyświetlanie punktów.
        snakeMovementInterval = snakeMovement();
        drawingPointElementInHtmlInterval = drawingPointElementInHtml();
        drawingSnakeInHtmlInterval = drawingSnakeInHtml();

        // Usunięcie wiadomości o przegranej grze oraz tła.
        loseScreenEl.innerText = '';
        boardEl.classList.remove('is-transparent');
    };

    // Rozpoczęcie gry!
    startEl.addEventListener('click', () => startGame());
   
    // Pauzowanie gry.
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
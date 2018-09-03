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


    const allSnake = [];
    // Aktualna pozycja węża na siatce względem osi X jak i Y.
    let snakePositionX;
    let snakePositionY;
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

    // Stworzenie dwuwymiarowej tablicy - 20x20.
    for (let i = 0; i < boardSize; i++) {
        arrayTiles[i] = [];
    };
    for (let y = 0; y < boardSize; ++y) {
        for (let x = 0; x < boardSize; ++x ) {
            // Stworzenie dynamicznie diva który będzie kafelkiem, wystylizowanie go.
            let tile = document.createElement('div');
            tile.classList.add('tile-board');
            //tile.innerText = `x: ${x}, y: ${y}`
            // Dodanie kafelka do htmla. 
            boardEl.appendChild(tile);
            // Wypełnienie tablicy stworzonymi divami.
            arrayTiles[x][y] = tile;
        };
    };


    const creatingASnake = new Map()
    creatingASnake.set('ArrowUp', 'rotate(0deg)')
    creatingASnake.set('ArrowDown', 'rotate(180deg)')
    creatingASnake.set('ArrowLeft', 'rotate(-90deg)')
    creatingASnake.set('ArrowRight', 'rotate(90deg)')
    
    // Funkcja która wyświetla węża na planszy.
    const displaySnake = () => {
        // Dodanie do elementów węża klasy która stylizuje węża.
        snake.forEach(el => el.classList.add('part-of-the-snake'))
        let indexStary;
        let indexObecny;
        let indexNowy
        
       /* for (let i = 0; i < allSnake.length; i++) {
            indexStary = allSnake[i-1]
            indexObecny = allSnake[i]
            indexNowy = allSnake[i+1]
            if (indexStary === undefined) {
                indexNowy.div.classList.remove('snake-head')
                indexObecny.div.classList.add('snake-head')
                indexObecny.div.style.transform = creatingASnake.get(direction);
            } else if (indexNowy === undefined) {
                indexStary.div.classList.remove('snake-tail') 
                indexObecny.div.classList.add('snake-tail')
            } else if ( indexObecny !== undefined && indexNowy !== undefined && indexStary !== undefined) {
                indexObecny.div.classList.add('snake-torso')
            } 
        }*/
        /*console.log(indexStary, indexObecny, indexNowy)
        if ( indexStary.x === indexObecny.x && indexObecny.x === indexNowy) {
            console.log('EUREKA')
        }
        */
    };

    // Funkcja, która aktualizuje długość węża przy ruchu.
    const updateLenghtSnake = () => {
        // Usunięcie klasy stylizującej węża z ostatniego elementu tablicy.
        let lenghtSnake = snake.length;
        const lastElementIndex = lenghtSnake - 1;
        snake[lastElementIndex].classList.remove('part-of-the-snake');
        // Usunięcie ostatniego elementu z tablicy.
        snake.splice(lastElementIndex, 1);
        //const lastIndex = allSnake.length - 1
        allSnake[(lastElementIndex -1)].div.classList.remove('snake-torso')
        allSnake[lastElementIndex].div.classList.remove('snake-torso') 
        allSnake[lastElementIndex].div.classList.remove('snake-tail')  
        allSnake.splice(lastElementIndex, 1)
    };

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

    // Tablica która przechowuje kafelki na których wąż się znajduje.
    let snake = [];
    // Ustanona długość węża.
    const initialSnakeLength = 6;

    // Funkcja która czyści plansze po poprzednim wężu.
    const boardCleaning = () => {
        const tileBoardEl = document.querySelectorAll('.tile-board');
        tileBoardEl.forEach((el) => {
            el.classList.remove('part-of-the-snake');
            el.classList.remove('point-element');
        }); 
        elementPosition = '';
    }

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
            allSnake.push(object)
            snake.push(arrayTiles[object.x][object.y]);
            };
        } else if (randomNumber > 0.25 && randomNumber < 0.5) {
            direction = 'ArrowUp';
            for (let i = 0; i < initialSnakeLength; i++) {
                const object = {x: snakePositionX, y:snakePositionY + i, div: arrayTiles[snakePositionX][snakePositionY + i] }     
                allSnake.push(object)
                snake.push(arrayTiles[snakePositionX][snakePositionY + i]);
            };
        } else if (randomNumber > 0.5 && randomNumber < 0.75) {
            direction = 'ArrowDown';
            for (let i = 0; i < initialSnakeLength; i++) {
                const object = {x: snakePositionX, y:snakePositionY - i, div: arrayTiles[snakePositionX][snakePositionY - i] }     
                allSnake.push(object)
                snake.push(arrayTiles[snakePositionX][snakePositionY - i]);
            };  
        } else if (randomNumber > 0.75) {
            direction = 'ArrowRight';
            for (let i = 0; i < initialSnakeLength; i++) {
                const object = {x: snakePositionX-i, y:snakePositionY, div: arrayTiles[snakePositionX -i][snakePositionY] }     
                allSnake.push(object)
                snake.push(arrayTiles[snakePositionX - i][snakePositionY]);
            };     
        }; 
    }; 

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
        const randomPosition = Math.floor(Math.random() * (boardSize - 1));
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
        if (position < 0 || position > (boardSize-1)) {
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
        let theDirection = directionArray.find((el) => el.key === direction)
        // Aktualizacja pozycji węża.
        updatePosition(theDirection.axis, theDirection.factor)
        // Sprawdzenie czy wąż nie uderza w krawędź.
        checkingTheEdgeOfTheBoard(snakePositionX);
        checkingTheEdgeOfTheBoard(snakePositionY);
        // Sprawdzenie czy wąż nie uderza w siebie.
        checkingMoveSnake(snakePositionX, snakePositionY);
        // Dodanie nowego elementu węża na początek tablicy.
        const object = {x: snakePositionX, y: snakePositionY, div: arrayTiles[snakePositionX][snakePositionY] }     
        allSnake.unshift(object)
        snake.unshift(arrayTiles[snakePositionX][snakePositionY]); 
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
        } if (axis === 'y'){
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
                // Ruch węża zgodnie z wybranym kierunkiem.
                movements();
                // Aktualzacja długości węża przy zmianie pozycji.
                updateLenghtSnake();
                // Sprawdzanie czy punkt został zjedzony.
                checkingPointElement();
            };    
        }, 100);
    };

    // Wyświetlanie punktów na planszy.
    const drawingPointElementInHtml = () => {
        return setInterval( () => {
            if (!thePointInBoard && gameIsStarted && !pause) {
                displayPointElement();
            };
        } ,100);
    };

    // Wyświetlanie węża na planszy.
    const drawingSnakeInHtml = () => {
        return setInterval(() => {
            if (gameIsStarted && !pause) {   
                displaySnake();
            }    
        }, 100);
    };

    // Rozpoczęcie gry!
    const startGame = () => {
        // Zwróć funckje jeśli gra jest w trakcie.     
        if (gameIsStarted) {
            return;
        }
        // Gra jest w trakcie, zmiana wartości zmiennej.
        gameIsStarted = true;
        // Aktualizacja kierunku.
        direction = 'ArrowLeft';
        //Reset punktów i wyświetlenie ich w htmlu.
        point = 0;
        pointEl.innerText = `Punkty: ${point}`;
        thePointInBoard = false    

        // Wyczyszczenie planszy za pomocą funkcji.
        boardCleaning();
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
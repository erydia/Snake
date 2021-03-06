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
    }];

    // Aktualna pozycja węża na siatce względem osi X jak i Y.
    let snakePositionX;
    let snakePositionY;
    // Zmienna która zawiera pozycje wyświetlonego punktu na planszy.
    let pointPosition;
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

    // Tablica zawierająca informacje o pozycji portali.
    let portalArray = [];
    // Zmienna która przechowuje informacje o tym czy wąż ma contact z portalem.
    let firstPortalContact = false;

    // Tablica zawierająca obrazki stylizujące krzak.
    const bushImage = ['bush-1', 'bush-2', 'bush-3', 'bush-4'];
    // Tablica zawierająca wszystkie współrzędne krzaków.
    let bushArray = [];
    // Tablica zawierająca jedynie współrzędne jednego krzaka.
    let thisBush = [];

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

    // Funkcja która wyświetla węża na planszy.
    const displaySnake = () => {
        if (!theGameIsLost) {
            // Wyczyszczenie planszy ze zbędnych klas.
            snakeCleaning();

            // Zmienne pomocniczne trzymające elementy węża do porównywania.
            let oldElementIndex;
            let currentElementIndex;
            let newElemenetIndex;
            
            // Porównywanie elementów węża oraz nadawanie im odpowiedniej stylistyki po spełnieniu warunków.
            for (let i = 0; i < snake.length; i++) {
                oldElementIndex = snake[i-1];
                currentElementIndex = snake[i];
                newElemenetIndex = snake[i+1];
                // Stylizacja węża.
                determineSnakePartDirection(oldElementIndex, currentElementIndex, newElemenetIndex);
            };
        };    
    };

    // Funcja która stylizuję dwa fragmenty węża. 
    const setSnakePartImage = (obj1, obj2, elementToUpdate, additionalClasses) => {
        const isPointingLeft = obj1.x < obj2.x;
        const isPointinRight = obj1.x > obj2.x;
        const isPointingDown = obj1.y < obj2.y;
        const isPointingUp = obj1.y > obj2.y

        // Aplikuje wszystkie wymagane, podane klasy
        additionalClasses.forEach(c => elementToUpdate.div.classList.add(c));
        
        // Zmienna pomocnicza, aby móc skorzystać ze switcha
        const snakePartDirection = isPointingLeft || isPointinRight || isPointingDown || isPointingUp;

        switch (snakePartDirection) {
            case isPointingLeft: {
                elementToUpdate.div.classList.add('direction-left');
                break;
            };
            case isPointinRight: {
                elementToUpdate.div.classList.add('direction-right');
                break;
            };
            case isPointingDown: {
                elementToUpdate.div.classList.add('direction-up');
                break;
            };
            case isPointingUp: {
                elementToUpdate.div.classList.add('direction-down');
                break;
            };
            default: {
                throw new Error('something went completely wrong');
            };
        };
    };

    // Funkcja która stylizuje węża. 
    const determineSnakePartDirection = (oldElementIndex, currentElementIndex, newElemenetIndex) => {
        const isOldDefined = oldElementIndex !== undefined;
        const isNewDefined = newElemenetIndex !== undefined;

        currentElementIndex.div.classList.add('snake');

        if (!isOldDefined) {
            // Stylizacja główki węża.
            setSnakePartImage(currentElementIndex, newElemenetIndex, currentElementIndex, ['snake-head']);
        } else if (!isNewDefined) {
            // Stylizacja ogonka węża.
            setSnakePartImage(oldElementIndex, currentElementIndex, currentElementIndex, ['snake-tail']);
        } else if (isOldDefined) {
            // Stylizacja krawędzi węża.
            const isPointingUpDirectionUp = oldElementIndex.y < currentElementIndex.y;
            const isPointingUpDirectionDown = oldElementIndex.y > currentElementIndex.y;
            const isPointingLeftDirectionRight = currentElementIndex.x < newElemenetIndex.x;
            const isPointingLeftDirectionLeft = currentElementIndex.x > newElemenetIndex.x;
            const isPointingRightDirectionRight = oldElementIndex.x < currentElementIndex.x;
            const isPointingRightDirectionLeft = oldElementIndex.x > currentElementIndex.x;         
            const isPointingDownDirectionUp = currentElementIndex.y < newElemenetIndex.y;
            const isPointingDownDirectionDown = currentElementIndex.y > newElemenetIndex.y;


            if (isPointingUpDirectionUp && isPointingLeftDirectionRight || isPointingRightDirectionLeft && isPointingDownDirectionDown) {
                 currentElementIndex.div.classList.add('snake-edge');
                 currentElementIndex.div.classList.add('direction-up');
             } else if (isPointingUpDirectionDown && isPointingLeftDirectionLeft || isPointingRightDirectionRight && isPointingDownDirectionUp) {
                 currentElementIndex.div.classList.add('snake-edge');
                 currentElementIndex.div.classList.add('direction-down');
             } else if (isPointingRightDirectionLeft && isPointingDownDirectionUp || isPointingUpDirectionDown && isPointingLeftDirectionRight) {
                 currentElementIndex.div.classList.add('snake-edge');
                 currentElementIndex.div.classList.add('direction-right');
             } else if (isPointingRightDirectionRight && isPointingDownDirectionDown || isPointingUpDirectionUp && isPointingLeftDirectionLeft) {
                 currentElementIndex.div.classList.add('snake-edge');
                 currentElementIndex.div.classList.add('direction-left');
             }; 
             
             // Stylizacja zwykłego elementu weża.
             if (oldElementIndex.x === currentElementIndex.x && currentElementIndex.x === newElemenetIndex.x && newElemenetIndex.x === oldElementIndex.x){
                currentElementIndex.div.classList.add('snake-torso');
                currentElementIndex.div.classList.add('direction-up');
             } else if (oldElementIndex.y === currentElementIndex.y && currentElementIndex.y === newElemenetIndex.y && newElemenetIndex.y === oldElementIndex.y) {
                currentElementIndex.div.classList.add('snake-torso');
                currentElementIndex.div.classList.add('direction-left');
            };
        };        
    };

    // Funkcja która usuwa wszystkie klasy z kafelków po przegraniu gry oraz resetuje tablice.
    const boardCleaning = () => {
        const tileBoardEl = document.querySelectorAll('.tile-board')
        tileBoardEl.forEach((el) => {
            // Przypisanie do zmiennej klas zawartych na danym kafelku.
            let allClass = el.classList;
            // Usunięcie wszystkich zbędnych klas poza podstawową oraz klasą zawierającą punkt.
            for (let i = 1; i < allClass.length; i++) {
                el.classList.remove(el.classList.item(i));      
            };
            el.innerHTML = '';
        });
        portalArray = [];
        bushArray = [];
        pointPosition = '';
    };

    // Funkcja która usuwa wszystkie klasy z kafelków zajmowanych przez węża.
    const snakeCleaning = () => {
        snake.forEach((el) => {
            let allClass = el.div.classList;
            for (let i = 0; i < allClass.length; i++) {
                el.div.classList.remove(el.div.classList.item(i));       
            };
        });
    };

    // Nasłuchiwanie na zmiane kierunku oraz start i pauze gry. 
    document.addEventListener('keyup', (event) => {
        // Start gry.
        if (event.key === 's') {
            startGame();
        // Pauza gry.    
        } else if (event.key === 'p'){
            pauseGame();
        }
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
                let snakeElement = document.createElement('div')
                arrayTiles[snakePositionX + i][snakePositionY].appendChild(snakeElement)   
                const object = {x: snakePositionX + i, y:snakePositionY, tilePosition: arrayTiles[snakePositionX + i][snakePositionY], div: snakeElement };     
                snake.push(object);
            };
        } else if (randomNumber > 0.25 && randomNumber < 0.5) {
            direction = 'ArrowUp';
            for (let i = 0; i < initialSnakeLength; i++) {
                let snakeElement = document.createElement('div')
                arrayTiles[snakePositionX][snakePositionY + i].appendChild(snakeElement)
                const object = {x: snakePositionX, y:snakePositionY + i, tilePosition: arrayTiles[snakePositionX][snakePositionY + i], div: snakeElement };    
                snake.push(object);
            };
        } else if (randomNumber > 0.5 && randomNumber < 0.75) {
            direction = 'ArrowDown';
            for (let i = 0; i < initialSnakeLength; i++) {
                let snakeElement = document.createElement('div')
                arrayTiles[snakePositionX][snakePositionY - i].appendChild(snakeElement)
                const object = {x: snakePositionX, y:snakePositionY - i, tilePosition: arrayTiles[snakePositionX][snakePositionY - i], div: snakeElement };     
                snake.push(object);
            };  
        } else if (randomNumber > 0.75) {
            direction = 'ArrowRight';
            for (let i = 0; i < initialSnakeLength; i++) {
                let snakeElement = document.createElement('div')
                arrayTiles[snakePositionX -i][snakePositionY].appendChild(snakeElement)
                const object = {x: snakePositionX-i, y:snakePositionY, tilePosition: arrayTiles[snakePositionX -i][snakePositionY] , div: snakeElement };     
                snake.push(object);
            };     
        }; 
    }; 

    // Funkcja która losuje pozycje punktu i wyświetla go na planszy.
    const displayPointElement = () => {
        // Punkt został wyświetlony - zmianna zmiennej na true.
        thePointInBoard = true;
        thePointIsEaten = false;
        // Losowanie pozycji dla punktu na osi x jak i y.
        let pointPositionX = Math.floor(Math.random() * (boardSize - 1));
        let pointPositionY = Math.floor(Math.random() * (boardSize - 1));
        // Przypisanie do zmiennej kafelka z wylosowaną pozycją.
        pointPosition = arrayTiles[pointPositionX][pointPositionY];
        // Sprawdzenie czy punkt nie znajduję się na kafelku zajmowanym przez węża.
        let thePositionSnake = snake.find((el) => el.div === pointPosition);
        // Sprawdzenie czy punkt nie znajduję się na kafelku zawierającym krzak.
        let thePositionBush = bushArray.find((el) => el === pointPosition);
        // Sprawdzenie czy punkt nie znajduję się na kafelku zawierającym portal.
        let thePositionPortal = portalArray.find((el) => el.div === pointPosition);
        // Jeśli punkt ma tą samą pozycje co element węża - nie wyświetlaj go.
        if (thePositionSnake !== undefined || thePositionBush !== undefined || thePositionPortal !== undefined) {
            // Punkt nie ma wyznaczonej pozycji.
            pointPosition = '';
            // Punkt nie jest wyświetlony - zmiana zmiennej na false.
            thePointInBoard = false;
        // Jeśli punkt ma taką samą pozycje co element krzaka - nie wyświetlaj go.    
        } else {  
            // Nadanie klasy sytlizującej punkt.   
            pointPosition.classList.add('point-element');
        };
    };

    // Funkcja która sprawdza czy punkt został zjedzony przez węża.
    const checkingPointElement = () => {
        // Sprawdzenie czy wąż znajduję się na tej samej pozycji co punkt.
        let thisPoint = snake.find((el) => el.tilePosition === pointPosition);
        // Jeśli tak - gracz dostaje punkt, wąż powiększa się a element zostaje usunięty z planszy.
        if (thisPoint !== undefined) {
            // Usunięcie klasy stylizujacej punkt.
            pointPosition.classList.remove('point-element');
            // Punkt został zjedzony - zmiana zmiennej na true.
            thePointIsEaten = true;
            // Pozozycja punktu resetuje się.
            pointPosition = '';
            // Dodanie punktu do puli.
            point += 1;
            // Wyświetlenie punktów w htmlu.
            pointEl.innerText = `Punkty: ${point}`;
            // Punkt nie jest już wyświetlony - zmiana zmiennej na false.
            thePointInBoard = false;
            displaySnake();
        };    
    };

    // Funkcja która wyznacza pozycje krzaka.
    const positionBush = () => {
        // Zmienna która zawiera odległość od krawedź planszy.
        const lengthBush = 4;
        // Maksymalna i minimalna pozycja w jakiej krzak może się pojawić.
        const maxPosition = boardSize - lengthBush;
        const minPosition = lengthBush; 
        // Wylosowanie pozycji krzaka.  
        let bushPositionX = Math.floor(Math.random() * (maxPosition - minPosition + 1) + minPosition);
        let bushPositionY = Math.floor(Math.random() * (maxPosition - minPosition + 1) + minPosition);
        // Bazując na wylosowanej pozycji - określenie pozycji innych przyległych kafelków krzaka i dodanie ich do tablicy.
        thisBush.push(arrayTiles[bushPositionX][bushPositionY]);
        thisBush.push(arrayTiles[bushPositionX+1][bushPositionY]);
        thisBush.push(arrayTiles[bushPositionX][bushPositionY+1]);
        thisBush.push(arrayTiles[bushPositionX+1][bushPositionY+1]);
    }

    // Funkcja która stylizuje cały krzak.
    const getBushStyle = () => {
        for (let i = 0; i < thisBush.length; i++) {          
            thisBush[i].classList.add(bushImage[i]);
        };   
    };

    const checkingTheBushPostion = () => {
        // Sprawdzenie czy krzak nie pojawi się do 2 kratek przed wężem - jeśli tak nastąpi usunięcie go.
        const el = snake[0] // Pierwszy element węża.
        thisBush.find((thisEl) => {
            if (direction === 'ArrowUp') {
                if (arrayTiles[el.x][el.y-2] === thisEl || arrayTiles[el.x][el.y-1] === thisEl) {
                    thisBush = [];
                };
            } else if (direction === 'ArrowDown') {
                if (arrayTiles[el.x][el.y+2] === thisEl || arrayTiles[el.x][el.y+1] === thisEl) {
                    thisBush = [];
                };
            } else if (direction === 'ArrowLeft') {
                if (arrayTiles[el.x-2][el.y] === thisEl || arrayTiles[el.x-1][el.y] === thisEl) {
                    thisBush = [];
                };
            } else if (direction === 'ArrowRight') {
                if (arrayTiles[el.x+2][el.y] === thisEl || arrayTiles[el.x+1][el.y] === thisEl) {
                    thisBush = [];
                };
            };  
        });
    };

    // Funkcja która wyświetla krzaki w htmlu.  
    const displayBush = () => {    
        for( let i = 0; i < 4; i++) {
            displaySnake();
            // Wylosowanie pozycji krzaka
            positionBush();
            
            // Sprawdzenie czy wylosowany krzak nie znajduje się na wężu.
            snake.forEach((el) => {
                let thePosition = thisBush.find((thisEl) => thisEl === el.tilePosition);
                // Jeśli się znajduje - usunięcie wygenerowanego krzaka.
                if(thePosition !== undefined) {
                    thisBush = [];
                };    
            });
            // Sprawdzenie czy krzak nie pojawi się do 2 kratek przed wężem - jeśli tak nastąpi usunięcie go.
            checkingTheBushPostion();

            // Jeśli nie ma żadnego krzaka w tablicy dodaj go.
            if (bushArray.length === 0) {
                thisBush.forEach((el) => bushArray.push(el));
                getBushStyle();
                thisBush = [];
            } else {
                // Sprawdzednie czy pozycja wylosowanego krzaka nie znajduję się na krzaku już istniejącym.
                bushArray.forEach((el) => {
                    let thePosition = thisBush.find((thisEl) => thisEl === el);
                    // Jeśli się znajduję - usunięcie wygenerowanego krzaka.
                    if (thePosition !== undefined) {
                        thisBush = [];
                    };  
                });
                // Dodanie krzaka do tablicy.
                thisBush.forEach((el) => bushArray.push(el));
                // Wystylizowanie go.
                getBushStyle();
                thisBush = [];
            };
        };     
    };

    // Funkcja która sprawdza czy wąż uderzył w krzak. 
    const checkingTheBush = (x, y) => {
        let thisHit = bushArray.find((el) => el === arrayTiles[x][y]);
        // Jeśli uderzył - gra zostaje przegrana.
        if (thisHit !== undefined) {
            loseGame();
        };
    };

    // Funkcja która wyświetla portale na planszy.
    const generatingThePortal = (axis) => {
        // Wylosowanie pozycji portalu.
        let portalRandomPosition = Math.ceil(Math.random() * 18);  
        let randomNumber = Math.random();
        let portalPosition;
        // Dodanie portalu na osi X.
        if (axis === 'x') {
            if (randomNumber < 0.5) {
                portalPosition = arrayTiles[0][portalRandomPosition];
                let portalBox = document.createElement('div')
                portalBox.classList.add('portal');
                portalPosition.appendChild(portalBox);
                const object = { x: 0, y: portalRandomPosition, tilePosition: portalPosition, div: '', direction: 'ArrowRight' };     
                portalArray.push(object);
            } else {
                portalPosition = arrayTiles[19][portalRandomPosition];
                let portalBox = document.createElement('div')
                portalBox.classList.add('portal');
                portalPosition.appendChild(portalBox);
                const object = { x: 19, y: portalRandomPosition, tilePosition: portalPosition, div: '', direction: 'ArrowLeft' };     
                portalArray.push(object);
            };
        // Dodanie portalu na osi Y.    
        } else if (axis === 'y') {
            if (randomNumber < 0.5) {
                portalPosition = arrayTiles[portalRandomPosition][0];
                let portalBox = document.createElement('div')
                portalBox.classList.add('portal');
                portalPosition.appendChild(portalBox);
                const object = { x: portalRandomPosition, y: 0, tilePosition: portalPosition, div: '', direction: 'ArrowDown' };     
                portalArray.push(object);
            } else {
                portalPosition = arrayTiles[portalRandomPosition][19];
                let portalBox = document.createElement('div')
                portalBox.classList.add('portal');
                portalPosition.appendChild(portalBox);
                const object = { x: portalRandomPosition, y: 19, tilePosition: portalPosition, div: '', direction: 'ArrowUp' };     
                portalArray.push(object);
            };
        };
    };

   /* const displayPortal = () => {
        portalArray.forEach((el) => {
            let portalBox = document.createElement('div')
            portalBox.classList.add('portal');
            arrayTiles[el.x][el.y].appendChild(portalBox)
        })
    }*/



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

    // Funckaj która sprawdza czy wąż wszedł w portal - jeśli nie sprawdza czy uderzył w krawędź.
    const checkingThePortal = (x, y) => {
        // Sprawdzenie czy wąż jest na terenie portala.
        const theHit = portalArray.find((el) => el.tilePosition === snake[0].tilePosition);
        if (theHit !== undefined) {
            // Wyszukanie przeciwnego portala.
            const thisPortal = portalArray.find((el) => el !== theHit);
            // Wyjście węża przeciwnym portalem oraz zmiana kierunku.
            if (!firstPortalContact) {
                firstPortalContact = true;    
                snakePositionX = thisPortal.x;
                snakePositionY = thisPortal.y;
                direction = thisPortal.direction;
                /*portalArray = [];
                generatingThePortal('x');
                generatingThePortal('y');*/
            };
        } else {
            // Sprawdzenie czy wąż uderzył w krawędź X.
            checkingTheEdgeOfTheBoard(x);
            // Sprawdzenie czy wąż uderzył w krawędź Y.
            checkingTheEdgeOfTheBoard(y);
        };
        // Odświeżenie węża.
        displaySnake();
    };

    // Funkcja która aktualizuje kontakt węża z portalem.
    const updatePortal = () => {
        // Sprawdzenie czy pierwszy fragmenet węża jest poza terenem portali.
        const thePortal = portalArray.find((el) => el.tilePosition === snake[0].tilePosition)
        if(thePortal === undefined) {
            firstPortalContact = false;
        };    
    };

    // Funkcja która sprawdza czy wąż się nie zaplątał.
    const checkingMoveSnake = (x, y) => {
        // Sprawdzenie czy pola na których jest wąż pokrywają się z polem jakie wąż zamierza teraz odwiedzić.
        let thisHit = snake.find((el) => el.tilePosition === arrayTiles[x][y]);
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
        // Sprawdzenie czy wąż nie uderza w krawędź badź w portal.
        checkingThePortal(snakePositionX, snakePositionY)
        // Sprawdzenie czy wąż nie uderza w siebie.
        checkingMoveSnake(snakePositionX, snakePositionY);
        // Sprawdzenie czy wąż nie uderza w krzak.
        checkingTheBush(snakePositionX, snakePositionY);
        if (!theGameIsLost) {
            let snakeElement = document.createElement('div')
            arrayTiles[snakePositionX][snakePositionY].appendChild(snakeElement)
            // Dodanie nowego elementu węża na początek tablicy.
            const object = { x: snakePositionX, y: snakePositionY, tilePosition: arrayTiles[snakePositionX][snakePositionY], div: snakeElement };     
            snake.unshift(object);
        }    
    }; 

    // Funkcja, która aktualizuje długość węża przy ruchu.
    const updateLenghtSnake = () => {
        displaySnake();
        if (!thePointIsEaten) {   
            // Usunięcie klasy stylizującej węża z ostatniego elementu tablicy.
            let lenghtSnake = snake.length;
            const lastElementIndex = lenghtSnake - 1;
            const snakeElement = snake[lastElementIndex].tilePosition.querySelector('.snake');
            console.log('snakeElement', snakeElement, snake[lastElementIndex].tilePosition);
            if (snakeElement !== null) {
                snake[lastElementIndex].tilePosition.removeChild(snakeElement);
            }
            snake.splice(lastElementIndex, 1);   
        };   
        displaySnake();
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
                if (!theGameIsLost) {
                // Aktualzacja długości węża przy zmianie pozycji.
                    updateLenghtSnake();
                };
                // Aktualizacja informacji o kontakcie węża z portalami.
                updatePortal();
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
        boardCleaning();

        // Ustawienie pozycji węża.
        setSnakePosition();
        
        // Wyświetlenie portali na osi X jak i Y.
        generatingThePortal('x');
        generatingThePortal('y');

        // Wygenerowanie krzaków na planszy.
        displayBush(); 

        // Odpalenie intervali - ruch węża i aktualizacja go, wyświetlanie punktów.
        snakeMovementInterval = snakeMovement();
        drawingPointElementInHtmlInterval = drawingPointElementInHtml();
        drawingSnakeInHtmlInterval = drawingSnakeInHtml();

        // Usunięcie wiadomości o przegranej grze oraz tła.
        loseScreenEl.innerText = '';
        boardEl.classList.remove('is-transparent');    
    };

    const pauseGame = () => {
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
    };

    // Rozpoczęcie gry!
    startEl.addEventListener('click', () => startGame());
   
    // Pauzowanie gry.
    pauseEl.addEventListener('click', () => pauseGame());

});
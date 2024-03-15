document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameOfLifeCanvas');
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resolution = 10; // Adjust cell size
    const cols = canvas.width / resolution;
    const rows = canvas.height / resolution;

    let grid = newGrid();

    function newGrid() {
        return new Array(cols).fill(null)
            .map(() => new Array(rows).fill(null)
            .map(() => Math.floor(Math.random() * 2)));
    }

    function drawGrid() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for (let col = 0; col < grid.length; col++) {
            for (let row = 0; row < grid[col].length; row++) {
                const cell = grid[col][row];

                ctx.beginPath();
                ctx.rect(col * resolution, row * resolution, resolution, resolution);
                ctx.fillStyle = cell ? 'white' : 'black';
                ctx.fill();
                // Remove stroke for a cleaner look
            }
        }
    }

    function nextGenGrid() {
        const nextGen = grid.map(arr => [...arr]);

        for (let col = 0; col < grid.length; col++) {
            for (let row = 0; row < grid[col].length; row++) {
                const cell = grid[col][row];
                let numNeighbours = 0;
                for (let i = -1; i < 2; i++) {
                    for (let j = -1; j < 2; j++) {
                        if (i === 0 && j === 0) continue;
                        const x_cell = col + i;
                        const y_cell = row + j;

                        if (x_cell >= 0 && y_cell >= 0 && x_cell < cols && y_cell < rows) {
                            const currentNeighbour = grid[col + i][row + j];
                            numNeighbours += currentNeighbour;
                        }
                    }
                }

                // Rules of Life
                if (cell === 1 && numNeighbours < 2) nextGen[col][row] = 0;
                else if (cell === 1 && numNeighbours > 3) nextGen[col][row] = 0;
                else if (cell === 0 && numNeighbours === 3) nextGen[col][row] = 1;
                // Else, no change!
            }
        }

        return nextGen;
    }

    function update() {
        grid = nextGenGrid();
        drawGrid();
        requestAnimationFrame(update);
    }

    update();
});

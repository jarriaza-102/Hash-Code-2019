const express = require('express');
const router = express.Router();
const app = express();
const fs = require('fs');

router.get('/a', (req, res) => {
  const content = getSolution(slicePizza('in/a_example.in'));
  fs.writeFile('out/a_example.out', content, function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });
  return res.send('Done!');
});

router.get('/b', (req, res) => {
  const content = getSolution(slicePizza('in/b_small.in'));
  fs.writeFile('out/b_small.out', content, function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });
  return res.send('Done!');
});

router.get('/c', (req, res) => {
  const content = getSolution(slicePizza('in/c_medium.in'));
  fs.writeFile('out/c_medium.out', content, function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });
  return res.send('Done!');
});

router.get('/d', (req, res) => {
  const content = getSolution(slicePizza('in/d_big.in'));
  fs.writeFile('out/d_big.out', content, function (err) {
    if (err) throw err;
    console.log('File is created successfully.');
  });
  return res.send('Done!');
});

function getSolution(solutions) {
  const slices = solutions.slices;
  var length = slices.length;
  let solutionsRes = `${length}\n`;
  for (let i = 0; i < length; i++) {
    const slice = slices[i];
    solutionsRes += `${slice.fromY} ${slice.fromX} ${slice.toY} ${slice.toX}`;
    if (i < length - 1) {
      solutionsRes += '\n';
    }
  }
  return solutionsRes;
}

function getCell(row, col, ingredient) {
  return {
    row,
    col,
    ingredient,
    busy: false
  }
}

function getPizzaData(rows, cols, max, minimum, content) {
  let cells = new Array(rows);
  for (let y = 0; y < rows; y++) {
    const cells2 = new Array(cols);
    for (let x = 0; x < cols; x++) {
      cells2[x] = getCell(y, x, content[parseInt(y) + 1][x]);
    }
    cells[y] = cells2;
  }

  return {
    rows,
    cols,
    cells,
    max,
    minimum,
    slices: []
  };
}

function getVerticalSlices(startCol, startRow, pizza, max) {
  let slices = [];
  let coordinates = { fromX: 0, fromY: 0, toX: 0, toY: 0 };
  let ingredients = { tomatoes: 0, mushrooms: 0 };
  let length = 0;
  for (let x = startCol; x < pizza.cols; x++) {
    for (let y = startRow; y < pizza.rows; y++) {
      if (!pizza.cells[y][x].busy) {
        if (pizza.cells[y][x].ingredient == 'T') ingredients.tomatoes++;
        if (pizza.cells[y][x].ingredient == 'M') ingredients.mushrooms++;

        if (length == 0) {
          coordinates.fromX = x;
          coordinates.fromY = y;
        }

        length++;
        if (length == max) {
          if (ingredients.tomatoes >= pizza.minimum && ingredients.mushrooms >= pizza.minimum) {
            coordinates.toX = x;
            coordinates.toY = y;
            slices.push(coordinates);
            setCellsBusy(coordinates, pizza);
          }
          length = 0;
          coordinates = { fromX: 0, fromY: 0, toX: 0, toY: 0 };
          ingredients.tomatoes = 0;
          ingredients.mushrooms = 0;
          if (pizza.rows - y + 1 < pizza.max) {
            break;
          }
        } else if (length == pizza.rows && max - length == pizza.rows) {
          if (ingredients.tomatoes >= pizza.minimum && ingredients.mushrooms >= pizza.minimum) {
            const canComplete = canCompleteNextCol(x + 1, pizza);
            if (!canComplete) {
              coordinates.toX = x;
              coordinates.toY = y;
              slices.push(coordinates);
              setCellsBusy(coordinates, pizza);
              length = 0;
              coordinates = { fromX: 0, fromY: 0, toX: 0, toY: 0 };
              ingredients.tomatoes = 0;
              ingredients.mushrooms = 0;
              if (pizza.rows - y + 1 < pizza.max) {
                break;
              }
            }
          }
        }
      }
    }
  }
  return slices;
}

function canCompleteNextCol(col, pizza) {
  let response = true;
  let ingredients = { tomatoes: 0, mushrooms: 0 };
  for (let y = 0; y < pizza.rows; y++) {
    if (!pizza.cells[y][col].busy) {
      if (pizza.cells[y][col].ingredient == 'T') ingredients.tomatoes++;
      if (pizza.cells[y][col].ingredient == 'M') ingredients.mushrooms++;

      if (ingredients.tomatoes >= pizza.minimum && ingredients.mushrooms >= pizza.minimum) {
        response = false;
        break;
      }

    }
  }
  return response;
}

function getHorizontalSlices(startCol, startRow, pizza, max) {
  let slices = [];
  let ingredients = { tomatoes: 0, mushrooms: 0 };
  for (let y = startRow; y < pizza.rows; y++) {
    for (let x = startCol; x < pizza.cols; x++) {
      let coordinates = { fromX: 0, fromY: 0, toX: 0, toY: 0, cells: 0 };
      if (!pizza.cells[y][x].busy) {
        if (x + max <= pizza.cols) {
          coordinates.fromX = x;
          coordinates.fromY = y;
          coordinates.toX = 0;
          coordinates.toY = 0;
          coordinates.cells = 0;
          ingredients.tomatoes = 0;
          ingredients.mushrooms = 0;
          let lenght = 0;
          for (let i = x; i < x + max; i++) {
            if (!pizza.cells[y][i].busy) {
              lenght++;
              if (pizza.cells[y][i].ingredient == 'T') ingredients.tomatoes++;
              if (pizza.cells[y][i].ingredient == 'M') ingredients.mushrooms++;
              if (lenght == max &&
                ingredients.tomatoes >= pizza.minimum &&
                ingredients.mushrooms >= pizza.minimum) {
                coordinates.toX = i;
                coordinates.toY = y;
                slices.push(coordinates);
                setCellsBusy(coordinates, pizza);
              }
            } else {
              length = 0;
              coordinates = { fromX: 0, fromY: 0, toX: 0, toY: 0 };
              ingredients.tomatoes = 0;
              ingredients.mushrooms = 0;
            }
          }
        }
      }
    }
  }

  return slices;
}

function setCellsBusy(coordinates, pizza) {
  for (let y = coordinates.fromY; y <= coordinates.toY; y++) {
    for (let x = coordinates.fromX; x <= coordinates.toX; x++) {
      pizza.cells[y][x].busy = true;
    }
  }
}

function mapAsVertical(dataSet, content) {
  const pizza = getPizzaData(dataSet[0], dataSet[1], parseInt(dataSet[3]), parseInt(dataSet[2]), content);
  let slices = [];
  for (let i = pizza.max; i >= pizza.minimum * 2; i--) {
    slices = slices.concat(getVerticalSlices(0, 0, pizza, i));
  }
  return {
    slices: slices,
    count: slices.reduce(function (sum, slice) {
      return sum + (((slice.toX + 1) - (slice.fromX)) * ((slice.toY + 1) - (slice.fromY)))
    }, 0),
    pizza: pizza
  };
}

function mapAsHorizontal(dataSet, content) {
  const pizza = getPizzaData(dataSet[0], dataSet[1], parseInt(dataSet[3]), parseInt(dataSet[2]), content);
  let slices = [];
  for (let i = pizza.max; i >= pizza.minimum * 2; i--) {
    slices = slices.concat(getHorizontalSlices(0, 0, pizza, i));
  }
  return {
    slices: slices,
    count: slices.reduce(function (sum, slice) {
      return sum + (((slice.toX + 1) - (slice.fromX)) * ((slice.toY + 1) - (slice.fromY)))
    }, 0),
    pizza: pizza
  };
}

function mapAsBoth(dataSet, content, inverse) {
  const pizza = getPizzaData(dataSet[0], dataSet[1], parseInt(dataSet[3]), parseInt(dataSet[2]), content);
  let slices = [];
  for (let i = pizza.max; i >= pizza.minimum * 2; i--) {
    if (!inverse) {
      slices = slices.concat(getHorizontalSlices(0, 0, pizza, i));
      slices = slices.concat(getVerticalSlices(0, 0, pizza, i));
    } else {
      slices = slices.concat(getVerticalSlices(0, 0, pizza, i));
      slices = slices.concat(getHorizontalSlices(0, 0, pizza, i));
    }
  }
  return {
    slices: slices,
    count: slices.reduce(function (sum, slice) {
      return sum + (((slice.toX + 1) - (slice.fromX)) * ((slice.toY + 1) - (slice.fromY)))
    }, 0),
    pizza: pizza
  };
}

function getMax(arr, prop) {
  var max;
  for (var i = 0; i < arr.length; i++) {
    if (!max || parseInt(arr[i][prop]) > parseInt(max[prop]))
      max = arr[i];
  }
  return max;
}

function slicePizza(path) {
  const file = fs.readFileSync(path, 'utf8');
  const content = file.split('\n');
  const dataSet = content[0].split(' ');

  const slices = getMax([
    mapAsVertical(dataSet, content),
    mapAsHorizontal(dataSet, content),
    mapAsBoth(dataSet, content),
    mapAsBoth(dataSet, content, true)
  ], 'count');


  return {
    columns: dataSet[1],
    rows: dataSet[0],
    slices: slices.slices,
    count: slices.count,
    pizza: slices.pizza
  };

}

app.use('/', router);

module.exports = app;
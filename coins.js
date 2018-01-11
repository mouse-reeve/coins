function setup() {
    createCanvas(500, 500);

    coin(10, 10);

    noLoop();
}

function coin(x, y) {
    // ----- MATERIAL
    // hex color reference: https://web.njit.edu/~kevin/rgb.txt.html#metallic
    noStroke();
    var metals = {
        'copper': '#B87333',
        'brass': '#B5A642',
        'bronze': '#8C7853',
        'gold': '#CFB53B',
        'silver': '#C0C0C0',
        'steel': '#545454',
    }

    var metal = metals[choose(Object.keys(metals))];
    fill(metal);

    // ----- COIN SHAPE
    var shape = choose([circle, star, polygon])

    var radius = randint(40, 90);
    // position correctly on screen
    x = x + radius;
    y = y + radius;

    var radius2 = radius - (radius / randint(12, 20));
    var points = randint(9, 30);

    // 3 dimensionality;
    var depth = randint(3, 5);
    push();
    var shadow_color = lerpColor(color(metal), color('#000'), 0.5)
    fill(shadow_color);
    for (var i = 0; i < depth; i++) {
        shape(x+i, y+i, radius, points, radius2);
    }
    pop();


    shape(x, y, radius, points, radius2);

    // ----- BORDER
    push();
    var shadow_color = lerpColor(color(metal), color('#000'), 0.2)
    fill(shadow_color);
    var border_radius = radius2 - (radius2 / randint(6, 10));
    circle(x, y, border_radius);
    pop();

}

// --------- Random functions, because I miss python
function choose(choices) {
    return choices[Math.floor(Math.random() * choices.length)];
}
function randbool() {
    return Math.random > 0.5;
}

function randint(min, max) {
    return Math.floor((Math.random() * (max - min)) + min);
}


// --------- Shape functions
function circle(x, y, radius) {
    var diameter = radius * 2;
    return ellipse(x, y, diameter, diameter);
}

// taken directly from p5js.org examples
function star(x, y, radius1, points, radius2) {
    // args in this order to match polygon
    var angle = TWO_PI / points;
    var half_angle = angle / 2;
    beginShape();
    for (var a = 0; a < TWO_PI; a += angle) {
        var sx = x + cos(a) * radius2;
        var sy = y + sin(a) * radius2;
        vertex(sx, sy);
        sx = x + cos(a+half_angle) * radius1;
        sy = y + sin(a+half_angle) * radius1;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

function polygon(x, y, radius, npoints) {
    var angle = TWO_PI / npoints;
    beginShape();
    for (var a = 0; a < TWO_PI; a += angle) {
        var sx = x + cos(a) * radius;
        var sy = y + sin(a) * radius;
        vertex(sx, sy);
    }
    endShape(CLOSE);
}

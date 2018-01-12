var black, white;

function preload() {
    lato = loadFont('Lato-Bold.ttf');
}

function setup() {
    createCanvas(500, 500);

    black = color('#000');
    white = color('#FFF');

    for (var i = 0; i < 3; i++) {
        for (var j = 0; j < 3; j++) {
            var coin = new Coin(10 + 150 * i, 10 + 150 * j);
            coin.draw_coin();
        }
    }

    noLoop();
}

class Coin {
    constructor(x, y) {
        this.radius = randint(40, 90);

        // position correctly on screen
        this.x = x + this.radius;
        this.y = y + this.radius;

        this.point_radius = this.radius - (this.radius / randint(15, 20));
        // points on a star or sides of a polygon
        this.points = randint(9, 15);

        this.metal = color('#DDD');

        // keep track of which elements have been added to a coin
        this.components = [];
    }

    draw_coin() {
        this.base();
        // it seems like almost all coins have a border.
        this.border();

        if (Math.random() > 0.65) {
            this.flower();
        }

        if (!this.has_item('dots') && !this.has_item('flower') && Math.random() > 0.8) {
            this.crossbars();
        }

        this.cointext();
    }

    base() {
        fill(this.metal);
        stroke(lerpColor(this.metal, black, 0.2));

        // ----- COIN SHAPE
        this.shape = choose(['circle', 'star', 'polygon'])

        // 3 dimensionality;
        var depth = randint(3, 5);
        push();
        var shadow_color = lerpColor(this.metal, black, 0.5)
        fill(shadow_color);
        for (var i = 0; i < depth; i++) {
            eval(this.shape)(this.x+i, this.y+i, this.radius, this.points, this.point_radius);
        }
        pop();

        eval(this.shape)(this.x, this.y, this.radius, this.points, this.point_radius);
    }

    border() {
        push();
        var shadow_color = lerpColor(this.metal, black, 0.1)
        stroke(lerpColor(this.metal, black, 0.2));
        fill(shadow_color);
        this.border_radius = this.point_radius - (this.point_radius / randint(3, 20));
        circle(this.x, this.y, this.border_radius);
        pop();

        // there are often dots around the border
        if (Math.random() > 0.3) {
            this.border_dots();
        }
    }

    border_dots() {
        this.components.push('dots');
        push();
        fill(lerpColor(this.metal, white, 0.8));
        var dot_radius = Math.ceil(this.radius / 70);
        var dot_count = (TWO_PI * this.border_radius) / (dot_radius * 2 + 3);
        var angle = TWO_PI / dot_count;

        var offset = 2;
        // with a large border, you can put the dots inside
        if (this.radius - this.border_radius > 11 && Math.random() > 0.6) {
            var offset = -1 * (4 + dot_radius);
            fill(lerpColor(this.metal, black, 0.1));
        }
        for (var a = 0; a < TWO_PI; a += angle) {
            var sx = this.x + cos(a) * (this.border_radius - dot_radius - offset);
            var sy = this.y + sin(a) * (this.border_radius - dot_radius - offset);
            circle(sx, sy, dot_radius);
        }
        pop()
    }

    crossbars() {
        this.components.push('bars');
        push();
        var count = randint(3, 5);
        var offset = this.radius / 10;
        strokeWeight(offset / 3);
        stroke(this.metal);

        var radius = this.border_radius || this.radius;
        var angle = TWO_PI / 50;
        var a = PI;
        for (var i = 0; i < count; i++) {
            a += angle;
            var x1 = this.x + radius * cos(a) + 2;
            var y1 = this.y + radius * sin(a);
            var x2 = this.x + radius * cos(a + PI) - 2;
            line(x1, y1, x2, y1);
        }
        pop();
    }

    flower() {
        this.components.push('flower');
        push();

        var concentric = choose([1, 2, 2]);

        var points = randint(1, 3) * 2 + 1;
        for (var i = 0; i < concentric; i++) {
            var depth = randint(6, 20) / 10;
            var radius = (this.border_radius || this.radius) / (depth + 1);
            radius = radius / (i + 1 - (i * 0.8));
            var angle = TWO_PI / points;

            var angle_offset = i * angle / 2;

            for (var a = angle_offset; a < TWO_PI; a += angle) {
                var cx1 = this.x + radius * cos(a + (angle / 2));
                var cy1 = this.y + radius * sin(a + (angle / 2));
                var x1 = this.x + radius * cos(a + (angle / 4));
                var y1 = this.y + radius * sin(a + (angle / 4));
                var cx2 = this.x + (radius * depth) * cos(a);
                var cy2 = this.y + (radius * depth) * sin(a);

                bezier(this.x, this.y, cx1, cy1, x1, y1, cx2, cy2);

                cx1 = this.x + radius * cos(a - (angle / 2));
                cy1 = this.y + radius * sin(a - (angle / 2));
                x1 = this.x + radius * cos(a - (angle / 4));
                y1 = this.y + radius * sin(a - (angle / 4));
                cx2 = this.x + (radius * depth) * cos(a);
                cy2 = this.y + (radius * depth) * sin(a);

                bezier(this.x, this.y, cx1, cy1, x1, y1, cx2, cy2);
            }
        }

        circle(this.x, this.y, radius * (concentric * 0.8) / 4);

        pop();
    }

    cointext() {
        this.components.push('text');
        push();
        textFont(lato);
        textAlign(CENTER, TOP);

        fill(lerpColor(this.metal, white, 0.3));
        stroke(lerpColor(this.metal, black, 0.3));
        var message = '1 EURO';

        if (this.has_item('flower') || this.has_item('hole')) {
            message = '1EURO';
            textSize(this.radius/6);
            message = message.split('');
            var multipliers = [];
            for (i = 0 - message.length / 2; i < message.length / 2; i++) {
                multipliers.push(i);
            }
            var angle = HALF_PI / message.length;
            var a = 5 * PI / 4;

            var radius = (this.border_radius || this.radius) * 0.7;
            if (this.radius - this.border_radius > (this.radius / 4)) {
                var modifier = this.has_item('circle') ? 0.8 : 0.7;
                radius = this.radius * modifier;
            }
            for (var i = 0; i < message.length; i++) {
                var x = this.x - radius * cos(a);
                var y = this.y - radius * sin(a);
                push();
                translate(x, y);
                rotate(angle * multipliers[i]);
                text(message[message.length - i - 1], 0, 0);
                pop();
                a += angle;
            }
        } else {
            textSize(this.radius/3);
             text('1 EURO', this.x, this.y);
        }
        pop();
    }

    has_item(name) {
        return this.components.indexOf(name) != -1;
    }
}

// --------- Random functions, because I miss python
function choose(choices) {
    return choices[Math.floor(Math.random() * choices.length)];
}

function randint(min, max) {
    max += 1;
    return Math.floor((Math.random() * (max - min)) + min);
}


// --------- Shape functions
function circle(x, y, radius) {
    var diameter = radius * 2;
    return ellipse(x, y, diameter, diameter);
}

// taken directly from p5js.org examples
function star(x, y, radius1, points, point_radius) {
    // args in order to match polygon
    var angle = TWO_PI / points;
    var half_angle = angle / 2;
    beginShape();
    for (var a = 0; a < TWO_PI; a += angle) {
        var sx = x + cos(a) * point_radius;
        var sy = y + sin(a) * point_radius;
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

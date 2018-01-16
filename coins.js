var black, white;
var container;
var font;

function preload() {
    container = document.getElementById('coin');
    font_path = container.getAttribute('data-font');
    if (!!font_path) {
        font = loadFont(font_path);
    }
}

function setup() {
    black = color('#000');
    white = color('#FFF');

    var canvas = createCanvas(200, 200);
    canvas.parent(container);

    var text = container.getAttribute('data-text');

    var coin = new Coin(text);
    coin.draw_coin();

    noLoop();
}

class Coin {
    constructor(text) {
        this.text = text;

        this.radius = randint(40, 90);

        // position correctly on screen
        this.x = height / 2;//this.radius;
        this.y = width / 2;//this.radius;

        this.point_radius = this.radius - (this.radius / randint(15, 20));
        // points on a star or sides of a polygon
        this.points = randint(9, 15);

        this.metal = color('#DDD');
        this.depth = randint(3, 5);
        this.shadow_color = lerpColor(this.metal, black, 0.5);
        this.default_stroke = lerpColor(this.metal, black, 0.3);

        // hole info
        this.hole_edges = random([4, 5, 6, 100]);
        this.hole_radius = this.radius / random([2.5, 2.75, 3, 3.25, 3.5]);

        // keep track of which elements have been added to a coin
        this.components = [];
    }

    draw_coin() {
        if (Math.random() > 0.7) {
            this.components.push('hole');
        }

        this.base();
        // it seems like almost all coins have a border.
        this.border();

        if (!this.has_item('hole')) {
            if (!this.has_item('dots') && !this.has_item('flower') && Math.random() > 0.5) {
                this.crossbars();
                this.center_text()
            } else {
                this.center_flower();
            }

        }

        if (!this.has_item('bars')) {
            this.border_text();
        }
    }

    base() {
        push();
        fill(this.metal);
        stroke(this.default_stroke);

        // ----- COIN SHAPE
        this.shape = random(['circle', 'star', 'polygon'])

        // 3 dimensionality;
        push();
        noStroke();
        fill(this.shadow_color);
        for (var i = 0; i < this.depth; i++) {
            if (this.shape == 'circle') {
                this.circle(this.x + i, this.y + i, this.radius, true);
            } else if (this.shape == 'star') {
                this.star(this.x + i, this.y + i, this.radius, this.points, this.point_radius, true);
            } else if (this.shape == 'polygon') {
                this.polygon(this.x + i, this.y + i, this.radius, this.points, true);
            }
        }
        pop();

        if (this.shape == 'circle') {
            this.circle(this.x, this.y, this.radius, true);
        } else if (this.shape == 'star') {
            this.star(this.x, this.y, this.radius, this.points, this.point_radius, true);
        } else if (this.shape == 'polygon') {
            this.polygon(this.x, this.y, this.radius, this.points, true);
        }

        pop();
    }

    border() {
        push();
        var indent_color = lerpColor(this.metal, black, 0.1);
        stroke(lerpColor(this.metal, black, 0.2));
        fill(indent_color);
        this.border_radius = this.point_radius - (this.point_radius / randint(3, 20));

        this.border_inset = this.border_radius / 50;
        this.circle(this.x, this.y, this.border_radius, true);
        pop();

        // border shadow
        push();
        noStroke();
        fill(this.shadow_color);
        this.crescent(this.x, this.y, this.border_radius, this.border_inset);
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
        stroke(this.default_stroke);
        var dot_radius = Math.ceil(this.radius / 70);
        var dot_count = (TWO_PI * this.border_radius) / (dot_radius * 2 + 3);
        var angle = TWO_PI / dot_count;

        var offset = 2;
        var inset = this.border_inset / 2;
        // with a large border, you can put the dots inside
        if (this.radius - this.border_radius > 11 && Math.random() > 0.6) {
            var offset = -1 * (4 + dot_radius);
            inset = 0;
            fill(lerpColor(this.metal, black, 0.1));
        }

        push();
        fill(this.shadow_color);
        for (var a = 0; a < TWO_PI; a += angle) {
            var sx = (this.x + inset + 0.5) + cos(a) * (this.border_radius - dot_radius - offset);
            var sy = (this.y + inset + 0.5) + sin(a) * (this.border_radius - dot_radius - offset);
            this.circle(sx, sy, dot_radius);
        }
        pop();

        for (var a = 0; a < TWO_PI; a += angle) {
            var sx = (this.x + inset) + cos(a) * (this.border_radius - dot_radius - offset);
            var sy = (this.y + inset) + sin(a) * (this.border_radius - dot_radius - offset);
            this.circle(sx, sy, dot_radius);
        }
        pop();
    }

    crossbars() {
        this.components.push('bars');
        push();
        var count = randint(3, 5);
        var offset = this.radius / 10;
        strokeWeight(offset / 3);

        var radius = this.border_radius || this.radius;

        push();
        stroke(this.shadow_color);
        this.lines(this.x, this.y, radius, count, 0.5);
        pop();

        stroke(this.metal);
        this.lines(this.x, this.y, radius, count, 0);
        pop();
    }

    lines(x, y, radius, count, offset) {
        var angle = TWO_PI / 50;
        var a = PI;
        for (var i = 0; i < count; i++) {
            a += angle;
            var x1 = x + radius * cos(a) + 2 + this.border_inset;
            var y1 = y + radius * sin(a) + this.border_inset + offset;
            var x2 = x + radius * cos(a + PI) - 2 + this.border_inset;
            line(x1, y1, x2, y1);
        }

    }

    center_flower() {
        this.components.push('flower');
        push();

        fill(this.metal);
        stroke(this.default_stroke);
        var radius = (this.border_radius || this.radius) / 2.5;
        this.flower(this.x, this.y, radius);

        pop();
    }

    border_flowers() {
        var count = this.hole_edges < 10 ? this.hole_edges : 4;
        var angle = TWO_PI / count;
        var seed = (new Date).getTime();
        push();
        fill(this.metal);
        stroke(this.default_stroke);

        var angle_offset = this.hole_edges == 4 ? PI / 2.35 : 0;
        for (var a = angle_offset; a < TWO_PI + (angle_offset); a += angle) {
            var sx = this.x + cos(a) * (this.border_radius * 0.6);
            var sy = this.y + sin(a) * (this.border_radius * 0.6);

            this.flower(sx, sy, this.border_radius / 7, seed);
        }
        pop()
    }

    flower(x, y, radius, seed) {
        if (seed) {
            randomSeed(seed);
        }
        var concentric = random([1, 2, 2]);

        var points = Math.floor(random(1, 4)) * 2 + 1;
        for (var i = 0; i < concentric; i++) {
            var depth = Math.floor(random(6, 21)) / 10;
            radius = radius / (i + 1 - (i * 0.8));

            // adds shadow
            push();
            fill(this.shadow_color);
            noStroke();
            this.flower_part(x + 1, y + 1, radius, points, depth, i);
            pop();

            this.flower_part(x, y, radius, points, depth, i);
        }
        this.circle(x, y, radius * (concentric * 0.8) / 4);
        if (seed) {
            randomSeed((new Date).getTime());
        }
    }

    flower_part(x, y, radius, points, depth, offset) {
        offset = offset ? 1 : 0;
        var angle = TWO_PI / points;
        var angle_offset = offset * angle / 2;
        for (var a = angle_offset; a < TWO_PI; a += angle) {
            var cx1 = x + radius * cos(a + (angle / 2));
            var cy1 = y + radius * sin(a + (angle / 2));
            var x1 = x + radius * cos(a + (angle / 4));
            var y1 = y + radius * sin(a + (angle / 4));
            var cx2 = x + (radius * depth) * cos(a);
            var cy2 = y + (radius * depth) * sin(a);

            bezier(x, y, cx1, cy1, x1, y1, cx2, cy2);

            cx1 = x + radius * cos(a - (angle / 2));
            cy1 = y + radius * sin(a - (angle / 2));
            x1 = x + radius * cos(a - (angle / 4));
            y1 = y + radius * sin(a - (angle / 4));
            cx2 = x + (radius * depth) * cos(a);
            cy2 = y + (radius * depth) * sin(a);

            bezier(x, y, cx1, cy1, x1, y1, cx2, cy2);
        }
    }

    border_text() {
        this.components.push('text');
        push();
        if (font) {
            textFont(font);
        }
        textAlign(CENTER, TOP);

        fill(lerpColor(this.metal, white, 0.3));
        stroke(lerpColor(this.metal, black, 0.3));

        textSize(this.radius/6);
        var message = this.text.split('') || '';

        var radius = (this.border_radius || this.radius) * 0.65;
        var inset = this.border_inset
        // place the text on the outside edge
        if (this.radius - this.border_radius > (this.radius / 4)) {
            var modifier = this.has_item('circle') ? 0.8 : 0.7;
            radius = this.radius * modifier;
            inset = 0;
        }

        // shadow
        push();
        noStroke();
        fill(this.shadow_color);
        this.rotated_text(this.x + 1, this.y + 1, message, radius, inset);
        pop();

        this.rotated_text(this.x, this.y, message, radius, inset)
        pop();
    }

    center_text() {
        this.components.push('text');
        push();
        textFont(font);
        textAlign(CENTER, TOP);
        textSize(this.radius/3.5);
        fill(lerpColor(this.metal, white, 0.3));
        stroke(lerpColor(this.metal, black, 0.3));

        // shadow
        push();
        fill(this.shadow_color);
        text('1 EURO', this.x + 0.75, this.y + 0.75);
        pop();

        text('1 EURO', this.x, this.y);
        pop()
    }

    rotated_text(x, y, message, radius, inset) {
        var multipliers = [];
        for (i = 0 - message.length / 2; i < message.length / 2; i++) {
            multipliers.push(i);
        }
        var angle = HALF_PI / message.length;
        var a = 5 * PI / 4;
        for (var i = 0; i < message.length; i++) {
            var cx = x - radius * cos(a) + inset;
            var cy = y - radius * sin(a) + inset;
            push();
            translate(cx, cy);
            rotate(angle * multipliers[i]);
            text(message[message.length - i - 1], 0, 0);
            pop();
            a += angle;
        }
    }

    has_item(name) {
        return this.components.indexOf(name) != -1;
    }

    // shape functions
    circle(x, y, radius, holeable) {
        this.polygon(x, y, radius, 100, holeable);
    }

    // taken directly from p5js.org examples
    star(x, y, radius1, points, point_radius, holeable) {
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
        if (holeable) {
            this.hole(x, y);
        }
        endShape(CLOSE);
    }

    polygon(x, y, radius, npoints, holeable) {
        var angle = TWO_PI / npoints;
        beginShape();
        for (var a = 0; a < TWO_PI; a += angle) {
            var sx = x + cos(a) * radius;
            var sy = y + sin(a) * radius;
            vertex(sx, sy);
        }
        if (holeable) {
            this.hole(x, y);
        }
        endShape(CLOSE);
    }

    hole(x, y) {
        if (this.has_item('hole')) {
            push();
            var angle = TWO_PI / this.hole_edges;
            beginContour();
            noStroke();
            for (var a = TWO_PI + (PI / 5); a > 0 + (PI / 5); a -= angle) {
                var sx = x + cos(a) * this.hole_radius;
                var sy = y + sin(a) * this.hole_radius;
                vertex(sx, sy);
            }
            endContour();
            pop();
        }
    }

    crescent(x, y, radius, offset_value) {
        beginShape();

        var angle = TWO_PI / 100;
        for (var a = 0; a < TWO_PI; a += angle) {
            var sx = x + cos(a) * radius;
            var sy = y + sin(a) * radius;
            vertex(sx, sy);
        }

        beginContour();
        for (var a = TWO_PI; a > 0; a -= angle) {
            var offset = 0;
            if (a > 3 * PI / 4 && a < 7 * PI / 4) {
                offset = offset_value
            }
            var sx = x + offset + cos(a) * radius;
            var sy = y + offset + sin(a) * radius;
            vertex(sx, sy);
        }
        endContour();
        endShape();
    }

}

function randint(min, max) {
    max += 1;
    return Math.floor((Math.random() * (max - min)) + min);
}

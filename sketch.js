//Animation for Trio Tain

//Color change
let H1 = 0;
let shade = 0;

//Bird flock
let flock

//Bubbles
let bubbles = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);
  frameRate(20);
  //background(200, 100, 50);
  background(0);
  // background(H1, 30, 100);

  //Create Flock
  flock = new Flock();
  for (let i = 0; i < 100; i++){
    let b = new Bird(random(width), height/2);
    flock.addBird(b);
  }

  //Create Bubbles
  for (var j = 0; j < 100; j++) {
		var x = 10+10 * j;
		bubbles[j] = new Bubble(random(width), random(height), random(10));
	}
}

function draw() {
  background(0, 100, 30, 5);
  // background(200, 100, 50, 20);
  // background(0, 10);
  //Change Color
  shade += 0.25;
  H1 += 0.25;
  
  //Viral Flock
  flock.run();
  if (H1 >= 70 || H1 == 0){
    H1*=-1;
  }

  //Bubbles
  if (frameCount%3==0){
  for (let i = 0; i < bubbles.length; i++) {
		bubbles[i].move();
    bubbles[i].edges();
		bubbles[i].show();
	}
}

}

class Flock {
  constructor() {
    this.birds = [];
  }

  run() {
    for (let bird of this.birds){
      bird.run(this.birds);
    }
  }

  addBird(b) {
    this.birds.push(b);
  }
}

function mousePressed(){
  let fs = fullscreen();
  fullscreen(!fs);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  background(0);
}

class Bird {
  constructor(x, y) {
    this.accel = createVector(0,0);
    this.vel = createVector(random(-1, 1), random(-1, 1));
    this.pos = createVector(x, y);
    this.r = 100;
    this.maxspeed = 3; // Maximum speed
    this.maxforce = 0.05; // Maximum steering force
    this.wig = random(30, 50);
    this.s = random(10, 100);
    
    //this.h = random(360);
    this.h = 0
  }

  run(birds) {
    this.flock(birds);
    this.update();
    this.borders();
    this.render();
  }

  applyForce(force) {
    this.accel.add(force);
  }

  flock(birds) {
    let sep = this.separate(birds); // Separation
    let ali = this.align(birds); // Alignment
    let coh = this.cohesion(birds); // Cohesion
    // Arbitrarily weight these forces
    sep.mult(1.5);
    ali.mult(1.0);
    coh.mult(1.0);
    // Add the force vectors to acceleration
    this.applyForce(sep);
    this.applyForce(ali);
    this.applyForce(coh);
  }

  update(){
    this.vel.add(this.accel);
    this.vel.limit(this.maxspeed);
    this.pos.add(this.vel);
    this.accel.mult(0);
    this.h -= 1;

    if (this.h <= 0){
      this.h = 360
    }
  }

  seek(target) {
    let desired = p5.Vector.sub(target, this.pos); // A vector pointing from the location to the target
    // Normalize desired and scale to maximum speed
    desired.normalize();
    desired.mult(this.maxspeed);
    // Steering = Desired minus Velocity
    let steer = p5.Vector.sub(desired, this.vel);
    steer.limit(this.maxforce); // Limit to maximum steering force
    return steer;
  }


  render() {
    // Draw a triangle rotated in the direction of velocity
    let theta = this.vel.heading() + radians(90);
    // noStroke();
    strokeWeight(2);
    // stroke(this.h, 100, 100);
    stroke(255);
    // if (frameCount%10==0){
    fill(random(150, 300), random(100), random(100), random(100));
    // fill(random(255), random(100));
    // noFill();
    // }
    push();
    translate(this.pos.x, this.pos.y);
    rotate(theta);
    for (let i; i < 50; i++){}
    // beginShape();
    // vertex(this.wig, this.wig);
    // vertex(-this.r * this.wig, this.r * this.wig);
    // vertex(this.wig, this.r*.5 * this.wig);
    // vertex(this.r/2 * this.wig, this.r * this.wig);
    // endShape(CLOSE);
    
     line(this.s, this.s, this.r + this.s, this.r + this.s)
    // circle(this.wig+random(5), this.wig+random(5), this.wig+random(20))
    rectMode(CENTER)
    noStroke();
    rect(this.wig+random(5), this.wig+random(5), this.wig*random(4), this.wig*random(4))
    pop();
  }

    // Wraparound
    borders() {
      if (this.pos.x < -this.r) this.pos.x = width + this.r;
      if (this.pos.y < -this.r) this.pos.y = height + this.r;
      if (this.pos.x > width + this.r) this.pos.x = -this.r;
      if (this.pos.y > height + this.r) this.pos.y = -this.r;
    }

  // Separation
  // Method checks for nearby birds and steers away
  separate(birds) {
    let desiredseparation = 25.0;
    let steer = createVector(0, 0);
    let count = 0;
    // For every boid in the system, check if it's too close
    for (let i = 0; i < birds.length; i++) {
      let d = p5.Vector.dist(this.pos, birds[i].pos);
      // If the distance is greater than 0 and less than an arbitrary amount (0 when you are yourself)
      if ((d > 0) && (d < desiredseparation)) {
        // Calculate vector pointing away from neighbor
        let diff = p5.Vector.sub(this.pos, birds[i].pos);
        diff.normalize();
        diff.div(d); // Weight by distance
        steer.add(diff);
        count++; // Keep track of how many
      }
    }
    
    // Average -- divide by how many
    if (count > 0) {
      steer.div(count);
    }

    // As long as the vector is greater than 0
    if (steer.mag() > 0) {
      // Implement Reynolds: Steering = Desired - Velocity
      steer.normalize();
      steer.mult(this.maxspeed);
      steer.sub(this.vel);
      steer.limit(this.maxforce);
    }
    return steer;
  }

  // Alignment
  // For every nearby boid in the system, calculate the average velocity
  align(birds) {
    let neighbordist = 50;
    let sum = createVector(0, 0);
    let count = 0;
    for (let i = 0; i < birds.length; i++) {
      let d = p5.Vector.dist(this.pos, birds[i].pos);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(birds[i].vel);
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      sum.normalize();
      sum.mult(this.maxspeed);
      let steer = p5.Vector.sub(sum, this.vel);
      steer.limit(this.maxforce);
      return steer;
    } else {
      return createVector(0, 0);
    }
  }

  // Cohesion
  // For the average location (i.e. center) of all nearby birds, calculate steering vector towards that location
  cohesion(birds) {
    let neighbordist = 50;
    let sum = createVector(0, 0); // Start with empty vector to accumulate all locations
    let count = 0;
    for (let i = 0; i < birds.length; i++) {
      let d = p5.Vector.dist(this.pos, birds[i].pos);
      if ((d > 0) && (d < neighbordist)) {
        sum.add(birds[i].pos); // Add location
        count++;
      }
    }
    if (count > 0) {
      sum.div(count);
      return this.seek(sum); // Steer towards the location
    } else {
      return createVector(0, 0);
    }
  }
}

class Bubble {
  constructor(x, y, r){
    this.x = x;
    this.y = y;
    this.r = r;
  }

  move() {
		this.x = this.x + random(-5, 5);
		this.y = this.y + random(-5);
	}

  edges(){
    if (this.x < 0){
      this.x = width;
    } else if (this.x > width){
      this.x = 0;
    }

    if (this.y < 0){
      this.y = height;
    } else if (this.y > height){
      this.y = 0;
      
    }

  }

	show() {
		noStroke();
    // stroke(0, 50);
    fill(0, 100, 100, 50);
    // fill(255, 50);
		ellipse(this.x, this.y, this.r * 2);
	}
}
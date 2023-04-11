const LEFT =   32; // binary 100000
const RIGHT =  16; // binary 010000
const BOTTOM = 8;  // binary 001000
const TOP =    4;  // binary 000100
const FAR =    2;  // binary 000010
const NEAR =   1;  // binary 000001
const FLOAT_EPSILON = 0.000001;

class Renderer {
    // canvas:              object ({id: __, width: __, height: __})
    // scene:               object (...see description on Canvas)
    constructor(canvas, scene) {
        this.canvas = document.getElementById(canvas.id);
        this.canvas.width = canvas.width;
        this.canvas.height = canvas.height;
        this.ctx = this.canvas.getContext('2d');
        this.scene = this.processScene(scene);
        this.enable_animation = true;  // <-- disabled for easier debugging; enable for animation
        this.start_time = null;
        this.prev_time = null;
        this.v = [];
        this.vcone = [];
        this.vcyl = [];
        this.vs = [];
    }

    //
    updateTransforms(time, delta_time) {
        // TODO: update any transformations needed for animation
        for(let m = 0; m < this.scene.models.length; m++){
        

        if(this.scene.models[m].animation != null) {

        if(this.scene.models[m].type !== 'generic'){
            //this.draw();
            let center = this.scene.models[m].center;
            //console.log(center.x);
            //let center = {x: 10, y: 10, z: -45};

            // matrix to translate back to origin
            let transform = new Matrix(4, 4);
            mat4x4Translate(transform, -center.x, -center.y, -center.z);

            let rotate = new Matrix(4, 4);
            if(this.scene.models[m].animation.axis === 'x') {
                mat4x4RotateX(rotate, delta_time/(1000/this.scene.models[m].animation.rps));
            } else if(this.scene.models[m].animation.axis === 'y'){
                mat4x4RotateY(rotate, delta_time/(1000/this.scene.models[m].animation.rps));
            } else {
                mat4x4RotateZ(rotate, delta_time/(1000/this.scene.models[m].animation.rps));
            }

            let ret = new Matrix(4, 4);
            mat4x4Translate(ret, center.x, center.y, center.z);
            
            let done = Matrix.multiply([ret, rotate, transform]);
            //let done2 = Matrix.multiply(done, transform);
            if(this.scene.models[m].type === 'cube') {
                for(let i = 0; i < this.v.length; i++) {
                    this.v[i] = Matrix.multiply([done, this.v[i]]);
                }
                this.draw();
            }
            else if(this.scene.models[m].type === 'cone') {
                for(let i = 0; i < this.vcone.length; i++) {
                    this.vcone[i] = Matrix.multiply([done, this.vcone[i]]);
                }
                this.draw();
            }
            else if(this.scene.models[m].type === 'cylinder') {
                for(let i = 0; i < this.v.length; i++) {
                    this.vcyl[i] = Matrix.multiply([done, this.vcyl[i]]);
                }
                this.draw();
            }
            else if(this.scene.models[m].type === 'sphere') {
                for(let i = 0; i < this.vs.length; i++) {
                    this.vs[i] = Matrix.multiply([done, this.vs[i]]);
                }
                this.draw();
            }
        }
        else {
            let center = {x: 10, y: 10, z: -45};
            // matrix to translate back to origin
            let transform = new Matrix(4, 4);
            mat4x4Translate(transform, -center.x, -center.y, -center.z);

            let rotate = new Matrix(4, 4);
            if(this.scene.models[m].animation.axis === 'x') {
                mat4x4RotateX(rotate, delta_time/(1000/this.scene.models[m].animation.rps));
            } else if(this.scene.models[m].animation.axis === 'y'){
                mat4x4RotateY(rotate, delta_time/(1000/this.scene.models[m].animation.rps));
            } else {
                mat4x4RotateZ(rotate, delta_time/(1000/this.scene.models[m].animation.rps));
            }
            
  
            let ret = new Matrix(4, 4);
            mat4x4Translate(ret, center.x, center.y, center.z);
            
            let done = Matrix.multiply([ret, rotate, transform]);
            //let done2 = Matrix.multiply(done, transform);

            for(let i = 0; i < this.scene.models[m].vertices.length; i++) {
                this.scene.models[m].vertices[i] = Matrix.multiply([done, this.scene.models[m].vertices[i]]);
            }
            this.draw();
        }
        }
    }

    }

    //
    rotateLeft() {
        let n = this.scene.view.prp.subtract(this.scene.view.srp);
        n.normalize();
        let u = this.scene.view.vup.cross(n);
        u.normalize();
        let v = n.cross(u);
        
        let rotation = new Matrix(4,4);

        let translateToOrigin = new Matrix(4,4);
        mat4x4Translate(translateToOrigin, this.scene.view.prp.x, this.scene.view.prp.y, this.scene.view.prp.z)
        let translateBack = new Matrix(4,4);
        mat4x4Translate(translateBack, -this.scene.view.prp.x, -this.scene.view.prp.y, -this.scene.view.prp.z)
        let srp = new Vector4(this.scene.view.srp.x, this.scene.view.srp.y, this.scene.view.srp.z, 1)

        mat4x4VRotation(rotation, -5, v);


        let rotateShift = Matrix.multiply([translateToOrigin, rotation, translateBack, srp]);

        this.scene.view.srp.x = rotateShift.x;
        this.scene.view.srp.y = rotateShift.y;
        this.scene.view.srp.z = rotateShift.z;


        this.draw()
        
    }
    
    //
    rotateRight() {
        let n = this.scene.view.prp.subtract(this.scene.view.srp);
        n.normalize();
        let u = this.scene.view.vup.cross(n);
        u.normalize();
        let v = n.cross(u);
        
        let rotation = new Matrix(4,4);

        let translateToOrigin = new Matrix(4,4);
        mat4x4Translate(translateToOrigin, this.scene.view.prp.x, this.scene.view.prp.y, this.scene.view.prp.z)
        let translateBack = new Matrix(4,4);
        mat4x4Translate(translateBack, -this.scene.view.prp.x, -this.scene.view.prp.y, -this.scene.view.prp.z)
        let srp = new Vector4(this.scene.view.srp.x, this.scene.view.srp.y, this.scene.view.srp.z, 1)

        mat4x4VRotation(rotation, 5, v);


        let rotateShift = Matrix.multiply([translateToOrigin, rotation, translateBack, srp]);

        this.scene.view.srp.x = rotateShift.x;
        this.scene.view.srp.y = rotateShift.y;
        this.scene.view.srp.z = rotateShift.z;


        this.draw()

        
    }
    
    //
    moveLeft() {
        let n = this.scene.view.prp.subtract(this.scene.view.srp);
        n.normalize();
        let u = this.scene.view.vup.cross(n);
        u.normalize();

        this.scene.view.srp = this.scene.view.srp.subtract(u);
        this.scene.view.prp= this.scene.view.prp.subtract(u);
        this.draw()
    }
    
    //
    moveRight() {
        let n = this.scene.view.prp.subtract(this.scene.view.srp);
        n.normalize();
        let u = this.scene.view.vup.cross(n);
        u.normalize();

        this.scene.view.srp = this.scene.view.srp.add(u);
        this.scene.view.prp= this.scene.view.prp.add(u);
        this.draw()
    }
    
    //
    moveBackward() {
        let n = this.scene.view.prp.subtract(this.scene.view.srp);
        n.normalize();

        this.scene.view.srp = this.scene.view.srp.add(n);
        this.scene.view.prp= this.scene.view.prp.add(n);
        this.draw()
    }
    
    //
    moveForward() {
        let n = this.scene.view.prp.subtract(this.scene.view.srp);
        n.normalize();
  
        this.scene.view.srp = this.scene.view.srp.subtract(n);
        this.scene.view.prp= this.scene.view.prp.subtract(n);
        this.draw()
    }

    //
    draw() {
        // TODO: implement drawing here!
        // For each model
        //   * For each vertex
        //     * transform endpoints to canonical view volume
        //   * For each line segment in each edge
        //     * clip in 3D
        //     * project to 2D
        //     * translate/scale to viewport (i.e. window)
        //     * draw line


        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        //for each model in scene
        for(let i = 0; i < this.scene.models.length; i++){
            
            if(this.scene.models[i].type === 'generic'){
                let newVertices = []

                // transform endpoints to canonical view volume
                for(let j = 0; j < this.scene.models[i].vertices.length; j++) {
                    newVertices.push(Matrix.multiply([mat4x4Perspective(this.scene.view.prp,this.scene.view.srp,this.scene.view.vup, this.scene.view.clip), this.scene.models[i].vertices[j]]));
                }
               
                // clip in 3D 
                let lines = [];
                for(let j = 0; j < this.scene.models[i].edges.length; j++){
                    for(let k = 0; k < this.scene.models[i].edges[j].length - 1; k++){          
                        let clippedLine = this.clipLinePerspective({pt0: newVertices[this.scene.models[i].edges[j][k]], pt1: newVertices[this.scene.models[i].edges[j][k + 1]]}, this.scene.view.clip[4]);
         
                        if(clippedLine != null){
                            lines.push([clippedLine.pt0,clippedLine.pt1])
                        } else {
                            lines.push([null,null])
                        }
                    }
                }
                
                // project to 2D and translate/scale to viewport (i.e. window)
                for(let j = 0; j < lines.length; j++){
                    for(let k = 0; k < lines[j].length; k++){ 
                        if(lines[j][k] != null){
                            lines[j][k] = Matrix.multiply([mat4x4Viewport(this.canvas.width, this.canvas.height), mat4x4MPer(), lines[j][k]])
                        }
                    }
                }


                // draw line
                for(let j = 0; j < lines.length; j++){
                    for(let k = 0; k < lines[j].length; k++){ 
                        if(lines[j][k] != null){
                            lines[j][k].values[0][0] = lines[j][k].values[0]/lines[j][k].values[3];
                            lines[j][k].values[1][0] = lines[j][k].values[1]/lines[j][k].values[3];
                        }
                    }
                }

                for(let j = 0; j < lines.length; j++){
                    for(let k = 0; k < lines[j].length-1; k++){ 
                        if(lines[j][k] != null && lines[j][k+1] != null){
                            this.drawLine(lines[j][k].values[0], lines[j][k].values[1], lines[j][k+1].values[0], lines[j][k+1].values[1])
                        }
                    }
                } 

            
            }

            if(this.scene.models[i].type === 'cube') {

                let v = []
                let edges = [];
                //create enough space for each edge
                for(let i = 0; i < 6; i++) {
                    edges.push([]);
                }
                //front top left 
                this.v.push(Vector4(this.scene.models[i].center.values[0][0]-this.scene.models[i].width/2, this.scene.models[i].center.values[1][0]+this.scene.models[i].height/2, this.scene.models[i].center.values[2][0]+this.scene.models[i].depth/2, 1));
                //back top left
                this.v.push(Vector4(this.scene.models[i].center.values[0][0]-this.scene.models[i].width/2, this.scene.models[i].center.values[1][0]+this.scene.models[i].height/2, this.scene.models[i].center.values[2][0]-this.scene.models[i].depth/2, 1));
                //back top right
                this.v.push(Vector4(this.scene.models[i].center.values[0][0]+this.scene.models[i].width/2, this.scene.models[i].center.values[1][0]+this.scene.models[i].height/2, this.scene.models[i].center.values[2][0]-this.scene.models[i].depth/2, 1));
                //front top right
                this.v.push(Vector4(this.scene.models[i].center.values[0][0]+this.scene.models[i].width/2, this.scene.models[i].center.values[1][0]+this.scene.models[i].height/2, this.scene.models[i].center.values[2][0]+this.scene.models[i].depth/2, 1));
                //front bottom left
                this.v.push(Vector4(this.scene.models[i].center.values[0][0]-this.scene.models[i].width/2, this.scene.models[i].center.values[1][0]-this.scene.models[i].height/2, this.scene.models[i].center.values[2][0]+this.scene.models[i].depth/2, 1));
                //back bottom left
                this.v.push(Vector4(this.scene.models[i].center.values[0][0]-this.scene.models[i].width/2, this.scene.models[i].center.values[1][0]-this.scene.models[i].height/2, this.scene.models[i].center.values[2][0]-this.scene.models[i].depth/2, 1));
                //back bottom right
                this.v.push(Vector4(this.scene.models[i].center.values[0][0]+this.scene.models[i].width/2, this.scene.models[i].center.values[1][0]-this.scene.models[i].height/2, this.scene.models[i].center.values[2][0]-this.scene.models[i].depth/2, 1));
                //front bottom right
                this.v.push(Vector4(this.scene.models[i].center.values[0][0]+this.scene.models[i].width/2, this.scene.models[i].center.values[1][0]-this.scene.models[i].height/2, this.scene.models[i].center.values[2][0]+this.scene.models[i].depth/2, 1));
                edges[0].push([0], [1], [2], [3], [0]);
                edges[1].push([4], [5], [6], [7], [4]);
                for(let i = 0; i < 4; i++) {
                    edges[i+2].push([i], [i+4]);
                }

                let newVertices = [];
                // project to 2D
                for(let j = 0; j < this.v.length; j++) {
                    newVertices.push(Matrix.multiply([mat4x4Perspective(this.scene.view.prp,this.scene.view.srp,this.scene.view.vup, this.scene.view.clip), this.v[j]]));
                }
                
                // clip in 3D 
                let lines = [];
                for(let j = 0; j < edges.length; j++){
                    for(let k = 0; k < edges[j].length - 1; k++){          
                        let clippedLine = this.clipLinePerspective({pt0: newVertices[edges[j][k]], pt1: newVertices[edges[j][k + 1]]}, this.scene.view.clip[4]);
            
                        if(clippedLine != null){
                            lines.push([clippedLine.pt0,clippedLine.pt1])
                        } else {
                            lines.push([null,null])
                        }
                    }
                }

                // project to 2D and translate/scale to viewport (i.e. window)
                for(let j = 0; j < lines.length; j++){
                    for(let k = 0; k < lines[j].length; k++){ 
                        if(lines[j][k] != null){
                            lines[j][k] = Matrix.multiply([mat4x4Viewport(this.canvas.width, this.canvas.height), mat4x4MPer(), lines[j][k]])
                        }
                    }
                }

                // draw line
                for(let j = 0; j < lines.length; j++){
                    for(let k = 0; k < lines[j].length; k++){ 
                        if(lines[j][k] != null){
                            lines[j][k].values[0][0] = lines[j][k].values[0]/lines[j][k].values[3];
                            lines[j][k].values[1][0] = lines[j][k].values[1]/lines[j][k].values[3];
                        }
                    }
                }
    
                for(let j = 0; j < lines.length; j++){
                    for(let k = 0; k <lines[j].length-1; k++){ 
                        if(lines[j][k] != null && lines[j][k+1] != null){
                            this.drawLine(lines[j][k].values[0], lines[j][k].values[1], lines[j][k+1].values[0], lines[j][k+1].values[1])
                        }
                    }
                } 
               


            }

        
            if(this.scene.models[i].type === 'cone') {
                //let v = [];
                let edges = [];
                //create enough space for each edge
                for(let index = 0; index < this.scene.models[i].sides+1; index++){
                    edges.push([]);
                }
                let a = (2*Math.PI)/this.scene.models[i].sides;
                for(let j = 0; j < this.scene.models[i].sides; j++){
                    let theta = (j + 1)*a;
                    this.vcone.push(Vector4((this.scene.models[i].center.values[0][0] + this.scene.models[i].radius*Math.cos(theta)), 
                        (this.scene.models[i].center.values[1][0]), 
                        (this.scene.models[i].center.values[2][0]+this.scene.models[i].radius*Math.sin(theta)), 
                        1));
                    
                    // bottom circle
                    edges[0].push([j])
                    edges[j+1].push([j], [this.scene.models[i].sides]);
                }
                edges[0].push([0]);
   
                //edges.push(0)
                this.vcone.push(Vector4(this.scene.models[i].center.values[0][0], this.scene.models[i].center.values[1][0] + this.scene.models[i].height, this.scene.models[i].center.values[2][0], 1));
                //console.log(v);
                
                let newVertices = [];
                // project to 2D
                for(let j = 0; j < this.vcone.length; j++) {
                    newVertices.push(Matrix.multiply([mat4x4Perspective(this.scene.view.prp,this.scene.view.srp,this.scene.view.vup, this.scene.view.clip), this.vcone[j]]));
                }
    
                // clip in 3D 
                let lines = [];
                for(let j = 0; j < edges.length; j++){
                    for(let k = 0; k < edges[j].length - 1; k++){          
                        let clippedLine = this.clipLinePerspective({pt0: newVertices[edges[j][k]], pt1: newVertices[edges[j][k + 1]]}, this.scene.view.clip[4]);
            
                        if(clippedLine != null){
                            lines.push([clippedLine.pt0,clippedLine.pt1])
                        } else {
                            lines.push([null,null])
                        }
                    }
                }
    
                
                // project to 2D and translate/scale to viewport (i.e. window)
                for(let j = 0; j < lines.length; j++){
                    for(let k = 0; k < lines[j].length; k++){ 
                        if(lines[j][k] != null){
                            lines[j][k] = Matrix.multiply([mat4x4Viewport(this.canvas.width, this.canvas.height), mat4x4MPer(), lines[j][k]])
                        }
                    }
                }
                
                // draw line
                // draw line
                for(let j = 0; j < lines.length; j++){
                    for(let k = 0; k < lines[j].length; k++){ 
                        if(lines[j][k] != null){
                            lines[j][k].values[0][0] = lines[j][k].values[0]/lines[j][k].values[3];
                            lines[j][k].values[1][0] = lines[j][k].values[1]/lines[j][k].values[3];
                        }
                    }
                }
    
                for(let j = 0; j < lines.length; j++){
                    for(let k = 0; k < lines[j].length-1; k++){ 
                        if(lines[j][k] != null && lines[j][k+1] != null){
                            this.drawLine(lines[j][k].values[0], lines[j][k].values[1], lines[j][k+1].values[0], lines[j][k+1].values[1])
                        }
                    }
                } 
                
                
    
            }
        
        
        if(this.scene.models[i].type === 'cylinder'){
            //console.log('cylinder');
            // center (3-component array), radius, height, sides
            //let v = [];
            let edges = [];
            //create enough space for each edge
            for(let index = 0; index < this.scene.models[i].sides+2; index++){
                edges.push([]);
            }
            
            let a = (2*Math.PI)/this.scene.models[i].sides;
            
            // top vertices and edges
            for(let j = 0; j < this.scene.models[i].sides; j++){
                let theta = (j + 1)*a;
                this.vcyl.push(Vector4((this.scene.models[i].center.values[0][0] + this.scene.models[i].radius*Math.cos(theta)), 
                    (this.scene.models[i].center.values[1][0] + (this.scene.models[i].height)/2), 
                    (this.scene.models[i].center.values[2][0]+this.scene.models[i].radius*Math.sin(theta)), 
                    1));
                
                // top edges
                edges[0].push([j])
                // bottom edges
                edges[1].push([j+this.scene.models[i].sides])
                // top to bottom edges
                edges[j+2].push([j])
                edges[j+2].push([j+this.scene.models[i].sides])
            }

            // bottom vertices
            for(let j = 0; j < this.scene.models[i].sides; j++){
                let theta = (j + 1)*a;
                this.vcyl.push(Vector4((this.scene.models[i].center.values[0][0] + this.scene.models[i].radius*Math.cos(theta)), 
                    (this.scene.models[i].center.values[1][0] - (this.scene.models[i].height)/2), 
                    (this.scene.models[i].center.values[2][0]+this.scene.models[i].radius*Math.sin(theta)), 
                    1));
            }

            // set last edge back to beginning edge to connect
            edges[0].push([0])
            edges[1].push([this.scene.models[i].sides])


            let newVertices = [];
            // project to 2D
            for(let j = 0; j < this.vcyl.length; j++) {
                newVertices.push(Matrix.multiply([mat4x4Perspective(this.scene.view.prp,this.scene.view.srp,this.scene.view.vup, this.scene.view.clip), this.vcyl[j]]));
            }


            // clip in 3D 
            let lines = [];
            for(let j = 0; j < edges.length; j++){
                for(let k = 0; k < edges[j].length - 1; k++){          
                    let clippedLine = this.clipLinePerspective({pt0: newVertices[edges[j][k]], pt1: newVertices[edges[j][k + 1]]}, this.scene.view.clip[4]);
        
                    if(clippedLine != null){
                        lines.push([clippedLine.pt0,clippedLine.pt1])
                    } else {
                        lines.push([null,null])
                    }
                }
            }
            
            // project to 2D and translate/scale to viewport (i.e. window)
            for(let j = 0; j < lines.length; j++){
                for(let k = 0; k < lines[j].length; k++){ 
                    if(lines[j][k] != null){
                        lines[j][k] = Matrix.multiply([mat4x4Viewport(this.canvas.width, this.canvas.height), mat4x4MPer(), lines[j][k]])
                    }
                }
            }


            // draw line
            for(let j = 0; j < lines.length; j++){
                for(let k = 0; k < lines[j].length; k++){ 
                    if(lines[j][k] != null){
                        lines[j][k].values[0][0] = lines[j][k].values[0]/lines[j][k].values[3];
                        lines[j][k].values[1][0] = lines[j][k].values[1]/lines[j][k].values[3];
                    }
                }
            }

            for(let j = 0; j < lines.length; j++){
                for(let k = 0; k < lines[j].length-1; k++){ 
                    if(lines[j][k] != null && lines[j][k+1] != null){
                        this.drawLine(lines[j][k].values[0], lines[j][k].values[1], lines[j][k+1].values[0], lines[j][k+1].values[1])
                    }
                }
            } 
        }




        if(this.scene.models[i].type === 'sphere'){
            // console.log('sphere');
            // center (3-component array), radius, slices, stacks
            //let v = [];
            let edges = []
            
            for(let index = 0; index < (this.scene.models[i].slices+this.scene.models[i].stacks+2); index++){
                edges.push([]);
            }

            let a = (2*Math.PI)/this.scene.models[i].slices;
            let b = (Math.PI)/this.scene.models[i].stacks; 

            
            for(let k = 0; k <= (this.scene.models[i].stacks); k++){
                let phi = Math.PI / 2 - k *b //(k + 1)*b;
                for(let j = 0; j < this.scene.models[i].slices; j++){
                    let theta = (j)*a;
                    
                    this.vs.push(Vector4((this.scene.models[i].center.values[0][0] + (this.scene.models[i].radius*Math.cos(phi))*Math.cos(theta)), 
                        (this.scene.models[i].center.values[1][0] +  (this.scene.models[i].radius*Math.cos(phi))*Math.sin(theta)), 
                        (this.scene.models[i].center.values[2][0] + this.scene.models[i].radius*Math.sin(phi)), 
                        1));

                    edges[k].push([k*(this.scene.models[i].slices) +j])
                    edges[this.scene.models[i].stacks +1 + j].push(j + k*(this.scene.models[i].slices))
                    
                }
                
            // set last edge back to beginning edge to connect
            edges[k].push([(k*this.scene.models[i].slices)])
            }
            // console.log(this.v);

            let newVertices = [];
            // project to 2D
            for(let j = 0; j < this.vs.length; j++) {
                newVertices.push(Matrix.multiply([mat4x4Perspective(this.scene.view.prp,this.scene.view.srp,this.scene.view.vup, this.scene.view.clip), this.vs[j]]));
            }

            // clip in 3D 
            let lines = [];
            for(let j = 0; j < edges.length; j++){
                for(let k = 0; k < edges[j].length - 1; k++){          
                    let clippedLine = this.clipLinePerspective({pt0: newVertices[edges[j][k]], pt1: newVertices[edges[j][k + 1]]}, this.scene.view.clip[4]);
     
                    if(clippedLine != null){
                        lines.push([clippedLine.pt0,clippedLine.pt1])
                    } else {
                        lines.push([null,null])
                    }
                }
            }
            
            // project to 2D and translate/scale to viewport (i.e. window)
            for(let j = 0; j < lines.length; j++){
                for(let k = 0; k < lines[j].length; k++){ 
                    if(lines[j][k] != null){
                        lines[j][k] = Matrix.multiply([mat4x4Viewport(this.canvas.width, this.canvas.height), mat4x4MPer(), lines[j][k]])
                    }
                }
            }


            // draw line
            for(let j = 0; j < lines.length; j++){
                for(let k = 0; k < lines[j].length; k++){ 
                    if(lines[j][k] != null){
                        lines[j][k].values[0][0] = lines[j][k].values[0]/lines[j][k].values[3];
                        lines[j][k].values[1][0] = lines[j][k].values[1]/lines[j][k].values[3];
                    }
                }
            }

            for(let j = 0; j < lines.length; j++){
                for(let k = 0; k < lines[j].length-1; k++){ 
                    if(lines[j][k] != null && lines[j][k+1] != null){
                        this.drawLine(lines[j][k].values[0], lines[j][k].values[1], lines[j][k+1].values[0], lines[j][k+1].values[1])
                    }
                }
            } 
        }

    }
        

    }

    // Get outcode for a vertex
    // vertex:       Vector4 (transformed vertex in homogeneous coordinates)
    // z_min:        float (near clipping plane in canonical view volume)
    outcodePerspective(vertex, z_min) {
        let outcode = 0;
        if (vertex.x < (vertex.z - FLOAT_EPSILON)) {   
            outcode += LEFT;
        }
        else if (vertex.x > (-vertex.z + FLOAT_EPSILON)) {  
            outcode += RIGHT;
        }
        if (vertex.y < (vertex.z - FLOAT_EPSILON)) {    
            outcode += BOTTOM;
        }
        else if (vertex.y > (-vertex.z + FLOAT_EPSILON)) {  
            outcode += TOP;
        }
        if (vertex.z < (-1.0 - FLOAT_EPSILON)) {   
            outcode += FAR;
        }
        else if (vertex.z > (z_min + FLOAT_EPSILON)) {    
            outcode += NEAR;
        }
        return outcode;
    }

        // Clip line - should either return a new line (with two endpoints inside view volume)
//             or null (if line is completely outside view volume)
// line:         object {pt0: Vector4, pt1: Vector4}
// z_min:        float (near clipping plane in canonical view volume)
    clipLinePerspective(line, z_min) {
        //console.log(line)
        let result = null;
        let p0 = Vector3(line.pt0.x, line.pt0.y, line.pt0.z);
        let p1 = Vector3(line.pt1.x, line.pt1.y, line.pt1.z);
        //console.log(line.pt0);
        let out0 = this.outcodePerspective(line.pt0, z_min);
        //console.log(line.pt1);
        let out1 = this.outcodePerspective(line.pt1, z_min);

        // Check if both endpoints are inside the view volume
        if ((out0 | out1) == 0) {
            //result = line;
            return line;
        }
        // Check if the line is completely outside the view volume
        else if ((out0 & out1) !== 0) {
            //result = null;
            return null;
        } else {
            let x, y, z, t;
            // Clip against left plane
            if (((out0 | out1) & 0b100000) !== 0) {
                if(out0 > out1) {
                    let t = (-p0.x + p0.z) / ((p1.x - p0.x) - (p1.z - p0.z));
                    let x = p0.x + t*(p1.x - p0.x);
                    let y = p0.y + t*(p1.y - p0.y);
                    let z = p0.z + t*(p1.z - p0.z);
                    let newLine = Vector4(x, y, z, 1);
                    result = {pt0: newLine, pt1: Vector4(p1.x, p1.y, p1.z, 1)};
                }
                else {
                    let t = (-p1.x + p1.z) / ((p1.x - p0.x) - (p1.z - p0.z));
                    let x = p1.x + t*(p1.x - p0.x);
                    let y = p1.y + t*(p1.y - p0.y);
                    let z = p1.z + t*(p1.z - p0.z);
                    let newLine = Vector4(x, y, z, 1);
                    result = {pt0: Vector4(p0.x, p0.y, p0.z, 1), pt1: newLine};
                }
            }

            // Clip against right plane
            else if (((out0 | out1) & 0b010000) !== 0) {
                if(out0 > out1) {
                    let t = (p0.x + p0.z) / (-(p1.x - p0.x) - (p1.z - p0.z));
                    let x = p0.x + t*(p1.x - p0.x);
                    let y = p0.y + t*(p1.y - p0.y);
                    let z = p0.z + t*(p1.z - p0.z);
                    let newLine = Vector4(x, y, z, 1);
                    result = {pt0: newLine, pt1: Vector4(p1.x, p1.y, p1.z, 1)};
                }
                else {
                    let t = (p1.x + p1.z) / (-(p1.x - p0.x) - (p1.z - p0.z));
                    let x = p1.x + t*(p1.x - p0.x);
                    let y = p1.y + t*(p1.y - p0.y);
                    let z = p1.z + t*(p1.z - p0.z);
                    let newLine = Vector4(x, y, z, 1);
                    result = {pt0: Vector4(p0.x, p0.y, p0.z, 1), pt1: newLine};
                }
            }
            // Clip against bottom plane
            else if (((out0 | out1) & 0b001000) !== 0) {
                if(out0 > out1) {
                    let t = (-p0.y + p0.z) / ((p1.y - p0.y) - (p1.z - p0.z));
                    let x = p0.x + t*(p1.x - p0.x);
                    let y = p0.y + t*(p1.y - p0.y);
                    let z = p0.z + t*(p1.z - p0.z);
                    let newLine = Vector4(x, y, z, 1);
                    result = {pt0: newLine, pt1: Vector4(p1.x, p1.y, p1.z, 1)};
                }
                else {
                    let t = (-p1.y + p1.z) / ((p1.y - p0.y) - (p1.z - p0.z));
                    let x = p1.x + t*(p1.x - p0.x);
                    let y = p1.y + t*(p1.y - p0.y);
                    let z = p1.z + t*(p1.z - p0.z);
                    let newLine = Vector4(x, y, z, 1);
                    result = {pt0: Vector4(p0.x, p0.y, p0.z, 1), pt1: newLine};
                }
            }
            // Clip against top plane
            else if (((out0 | out1) & 0b000100) !== 0) {
                if(out0 > out1) {
                    let t = (p0.y + p0.z) / (-(p1.y - p0.y) - (p1.z - p0.z));
                    let x = p0.x + t*(p1.x - p0.x);
                    let y = p0.y + t*(p1.y - p0.y);
                    let z = p0.z + t*(p1.z - p0.z);
                    let newLine = Vector4(x, y, z, 1);
                    result = {pt0: newLine, pt1: Vector4(p1.x, p1.y, p1.z, 1)};
                }
                else {
                    let t = (p1.y + p1.z) / (-(p1.y - p0.y) - (p1.z - p0.z));
                    let x = p1.x + t*(p1.x - p0.x);
                    let y = p1.y + t*(p1.y - p0.y);
                    let z = p1.z + t*(p1.z - p0.z);
                    let newLine = Vector4(x, y, z, 1);
                    result = {pt0: Vector4(p0.x, p0.y, p0.z, 1), pt1: newLine};
                }
            }
            // Clip against far plane
            else if (((out0 | out1) & 0b000010) !== 0) {
                if(out0 > out1) {
                    let t = (-p0.z - 1) / (p1.z - p0.z);
                    let x = p0.x + t*(p1.x - p0.x);
                    let y = p0.y + t*(p1.y - p0.y);
                    let z = p0.z + t*(p1.z - p0.z);
                    let newLine = Vector4(x, y, z, 1);
                    result = {pt0: newLine, pt1: Vector4(p1.x, p1.y, p1.z, 1)};
                }
                else {
                    let t = (-p1.z - 1) / (p1.z - p0.z);
                    let x = p1.x + t*(p1.x - p0.x);
                    let y = p1.y + t*(p1.y - p0.y);
                    let z = p1.z + t*(p1.z - p0.z);
                    let newLine = Vector4(x, y, z, 1);
                    result = {pt0: Vector4(p0.x, p0.y, p0.z, 1), pt1: newLine};
                }
            }
            // Clip against near plane
            else if (((out0 | out1) & 0b000001) !== 0) {
                if(out0 > out1) {
                    let t = (p0.z - z_min) / -(p1.z - p0.z);
                    let x = p0.x + t*(p1.x - p0.x);
                    let y = p0.y + t*(p1.y - p0.y);
                    let z = p0.z + t*(p1.z - p0.z);
                    let newLine = Vector4(x, y, z, 1);
                    result = {pt0: newLine, pt1: Vector4(p1.x, p1.y, p1.z, 1)};
                }
                else {
                    let t = (p1.z - z_min) / -(p1.z - p0.z);
                    let x = p1.x + t*(p1.x - p0.x);
                    let y = p1.y + t*(p1.y - p0.y);
                    let z = p1.z + t*(p1.z - p0.z);
                    let newLine = Vector4(x, y, z, 1);
                    result = {pt0: Vector4(p0.x, p0.y, p0.z, 1), pt1: newLine};
                }
            }
                // Create the clipped line
            //let clippedP0 = Vector4(p0.x, p0.y, p0.z, 1);
            //let clippedP1 = Vector4(p1.x, p1.y, p1.z, 1);
            //result = { pt0: clippedP0, pt1: clippedP1 };
        }
          //return result;
          return this.clipLinePerspective(result, z_min);

    }

    //
    animate(timestamp) {
        // Get time and delta time for animation
        if (this.start_time === null) {
            this.start_time = timestamp;
            this.prev_time = timestamp;
        }
        let time = timestamp - this.start_time;
        let delta_time = timestamp - this.prev_time;

    
        // Update transforms for animation
        this.updateTransforms(time, delta_time);

        // Draw slide
        this.draw();

        // Invoke call for next frame in animation
        if (this.enable_animation) {
            window.requestAnimationFrame((ts) => {
                this.animate(ts);
            });
        }

        // Update previous time to current one for next calculation of delta time
        this.prev_time = timestamp;
    }

    //
    updateScene(scene) {
        this.scene = this.processScene(scene);
        if (!this.enable_animation) {
            this.draw();
        }
    }

    //
    processScene(scene) {
        let processed = {
            view: {
                prp: Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]),
                srp: Vector3(scene.view.srp[0], scene.view.srp[1], scene.view.srp[2]),
                vup: Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]),
                clip: [...scene.view.clip]
            },
            models: []
        };

        for (let i = 0; i < scene.models.length; i++) {
            let model = { type: scene.models[i].type };
            if (model.type === 'generic') {
                model.vertices = [];
                model.edges = JSON.parse(JSON.stringify(scene.models[i].edges));
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    model.vertices.push(Vector4(scene.models[i].vertices[j][0],
                                                scene.models[i].vertices[j][1],
                                                scene.models[i].vertices[j][2],
                                                1));
                    if (scene.models[i].hasOwnProperty('animation')) {
                        model.animation = JSON.parse(JSON.stringify(scene.models[i].animation));
                    }
                }
            }
            else {
                model.center = Vector4(scene.models[i].center[0],
                                       scene.models[i].center[1],
                                       scene.models[i].center[2],
                                       1);
                for (let key in scene.models[i]) {
                    if (scene.models[i].hasOwnProperty(key) && key !== 'type' && key != 'center') {
                        model[key] = JSON.parse(JSON.stringify(scene.models[i][key]));
                    }
                }
            }

            model.matrix = new Matrix(4, 4);
            processed.models.push(model);
        }
        //console.log(processed)
        return processed;
    }
    
    // x0:           float (x coordinate of p0)
    // y0:           float (y coordinate of p0)
    // x1:           float (x coordinate of p1)
    // y1:           float (y coordinate of p1)
    drawLine(x0, y0, x1, y1) {
        this.ctx.strokeStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.moveTo(x0, y0);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();

        this.ctx.fillStyle = '#FF0000';
        this.ctx.fillRect(x0 - 2, y0 - 2, 4, 4);
        this.ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    }
};

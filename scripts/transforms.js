// create a 4x4 matrix to the perspective projection / view matrix
function mat4x4Perspective(prp, srp, vup, clip) { 
    // 1. translate PRP to origin
    let t_prp = new Matrix(4,4);
    t_prp.values = [[1, 0, 0, -(prp.values[0])],
                   [0, 1, 0, -(prp.values[1])],
                   [0, 0, 1, -(prp.values[2])],
                   [0, 0, 0, 1]];
    // 2. rotate VRC such that (u,v,n) align with (x,y,z)
    let n = prp.subtract(srp);
    //console.log("n=");
    //console.log(n);
    n.normalize();
    
    let u = vup.cross(n);
    u.normalize();
    let v = n.cross(u);

    let r = new Matrix(4,4);
    r.values = [[u.values[0][0], u.values[1][0], u.values[2][0], 0],
                [v.values[0][0], v.values[1][0], v.values[2][0], 0],
                [n.values[0][0], n.values[1][0], n.values[2][0], 0],
                [0, 0, 0, 1]];
    // 3. shear such that CW is on the z-axis
    let CW = [(clip[0] + clip[1]) / 2, (clip[2] + clip[3]) / 2, -clip[4]];
    let DOP = new Matrix(3,1);
    DOP.values = [CW[0], CW[1], CW[2]]
    
    let sh_per = new Matrix(4,4);
    sh_per.values = [[1, 0, (-DOP.values[0]/DOP.values[2]), 0],
                     [0, 1, (-DOP.values[1]/DOP.values[2]), 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
    // 4. scale such that view volume bounds are ([z,-z], [z,-z], [-1,zmin])
    let s_per = new Matrix(4, 4);
    s_per.values = [[((2*clip[4])/((clip[1]-clip[0])*clip[5])), 0, 0, 0],
                    [0, ((2*clip[4])/((clip[3]-clip[2])*clip[5])), 0, 0],
                    [0, 0, (1/clip[5]), 0],
                    [0, 0, 0, 1]];
    // ...
    // let transform = Matrix.multiply([...]);
    // return transform;

    let transform = Matrix.multiply([s_per, sh_per, r, t_prp]);
    let final = Matrix.multiply([mat4x4MPer(), transform]);
    return transform;
}

// create a 4x4 matrix to project a perspective image on the z=-1 plane
function mat4x4MPer() {
    let mper = new Matrix(4, 4);
    mper.values = [[1, 0, 0, 0],
                   [0, 1, 0, 0],
                   [0, 0, 1, 0],
                   [0, 0, -1, 0]];
    return mper;
}

// create a 4x4 matrix to translate/scale projected vertices to the viewport (window)
function mat4x4Viewport(width, height) {
    let viewport = new Matrix(4, 4);
    viewport.values = [[width/2, 0, 0, width/2],
                       [0, height/2, 0, height/2],
                       [0, 0, 1, 0],
                       [0, 0, 0, 1]];
    return viewport;
}


///////////////////////////////////////////////////////////////////////////////////
// 4x4 Transform Matrices                                                         //
///////////////////////////////////////////////////////////////////////////////////

// set values of existing 4x4 matrix to the identity matrix
function mat4x4Identity(mat4x4) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, 1, 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the translate matrix
function mat4x4Translate(mat4x4, tx, ty, tz) {
    mat4x4.values = [[1, 0, 0, tx],
                     [0, 1, 0, ty],
                     [0, 0, 1, tz],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the scale matrix
function mat4x4Scale(mat4x4, sx, sy, sz) {
    mat4x4.values = [[sx, 0, 0, 0],
                     [0, sy, 0, 0],
                     [0, 0, sz, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about x-axis matrix
function mat4x4RotateX(mat4x4, theta) {
    mat4x4.values = [[1, 0, 0, 0],
                     [0, Math.cos(theta), -Math.sin(theta), 0],
                     [0, Math.sin(theta), Math.cos(theta), 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about y-axis matrix
function mat4x4RotateY(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta), 0, Math.sin(theta), 0],
                     [0, 1, 0, 0],
                     [-Math.sin(theta), 0, Math.cos(theta), 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the rotate about z-axis matrix
function mat4x4RotateZ(mat4x4, theta) {
    mat4x4.values = [[Math.cos(theta), -Math.sin(theta), 0, 0],
                     [Math.sin(theta), Math.cos(theta), 0, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}

// set values of existing 4x4 matrix to the shear parallel to the xy-plane matrix
function mat4x4ShearXY(mat4x4, shx, shy) {
    mat4x4.values = [[1, 0, shx, 0],
                     [0, 1, shy, 0],
                     [0, 0, 1, 0],
                     [0, 0, 0, 1]];
}


// for rotation around v-axis
function mat4x4VRotation(mat4x4, theta, v){
    theta = theta * (Math.PI/180);
    mat4x4.values = [
                    [  (Math.cos(theta) + (Math.pow(v.x, 2)) * (1 - Math.cos(theta))), 
                       (v.x * v.y * (1 - Math.cos(theta)) - (v.z * Math.sin(theta))), 
                       (v.x * v.z * (1 - Math.cos(theta)) + (v.y * Math.sin(theta))),
                       0
                    ],
                    [
                       (v.y * v.x * (1 - Math.cos(theta)) + (v.z * Math.sin(theta))),
                       (Math.cos(theta) + (Math.pow(v.y, 2) * (1 - Math.cos(theta)))),
                       (v.y * v.z * (1 - Math.cos(theta)) - (v.x * Math.sin(theta))),
                       0
                    ],
                    [
                       (v.z * v.x * (1 - Math.cos(theta)) - (v.y * Math.sin(theta))),
                       (v.z * v.y * (1 - Math.cos(theta)) - (v.x * Math.sin(theta))),
                       (Math.cos(theta) + (Math.pow(v.z, 2) * (1 - Math.cos(theta)))),
                       0
                    ],
                    [
                        0, 0, 0, 1
                    ]
                ]
}

// create a new 3-component vector with values x,y,z
function Vector3(x, y, z) {
    let vec3 = new Vector(3);
    vec3.values = [x, y, z];
    return vec3;
}

// create a new 4-component vector with values x,y,z,w
function Vector4(x, y, z, w) {
    let vec4 = new Vector(4);
    vec4.values = [x, y, z, w];
    return vec4;
}

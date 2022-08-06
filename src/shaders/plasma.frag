precision highp float;
#define PI 3.1415926535897932384626433832795
 
uniform float u_time;
uniform float u_wrap;
uniform vec2 u_k;

varying vec2 vUv;
 
void main() {
    float v = 0.;
    vec2 c = vUv * u_k - u_k / 2.;
    v += sin((c.x + u_time));
    v += sin((c.y + u_time) / 2.);
    v += sin((c.x + c.y + u_time) / 2.);
    c += u_k / 2. * vec2(sin(u_time / 3.), cos(u_time / 2.));
    v += sin(sqrt(c.x * c.x + c.y * c.y + 1.) + u_time);
    v = v / 2.;
    /*
    v = sin(v * u_wrap * PI);
    vec3 col = vec3(v, v, v);
    /*/
    vec3 col = vec3(
        sin(u_wrap * v * PI),
        sin(u_wrap * v * PI + 2. * PI / 3.),
        cos(u_wrap * v * PI + 2. * PI / 4.)
    );
    //*/
    gl_FragColor = vec4(col * .5 + .5, 1);
}
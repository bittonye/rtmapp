import { Geoposition } from "@ionic-native/geolocation";

const pi_compute = (Math.PI/180);
const K=pi_compute*60*1853;
const KK=1000/3600;
const ITERATIONS = 50;

function degrees_to_radians(degrees: number)
{
  return degrees * pi_compute;
}

export interface ComputedPosition
{
    x: number;
    y: number;
    speed: number;
    heading: number;
    timestamp: number;
}

export function precompute_geoposition(pos: Geoposition)
{   
    const pos_lat_rad = degrees_to_radians(pos.coords.latitude);
    const pos_long_rad = degrees_to_radians(pos.coords.longitude);

    const y = pos_lat_rad * K;
    const x = pos_long_rad * Math.cos(pos_lat_rad) * K;

    return {
        x,
        y,
        speed: pos.coords.speed,
        heading:  degrees_to_radians(pos.coords.heading),
        timestamp:pos.timestamp,
    };
}

function deltaFunctions(speed: number, heading:number) {
    const speed_cos = speed * Math.cos(heading);
    const speed_sin = speed * Math.sin(heading);

    return {
        dx: speed_sin,
        dy: speed_cos,
    }
}

function compute_distance(x1: number, x2: number, y1: number, y2:number) {
    return ((x1 - x2)*(x1 - x2)+(y1-y2)*(y1-y2));
}

/**
 * Compute if two vehicles are about to colide based on the position
 * @param pos1 first position for route computation
 * @param pos2 second vehicle position
 */
export function compute_route(pos1: ComputedPosition, pos2: ComputedPosition) {

    const pos1_deltas = deltaFunctions(pos1.speed, pos1.heading);
    const pos2_deltas = deltaFunctions(pos2.speed, pos2.heading);

    let tdistance = 50;
    let distance = 50;
    let i = 0
    for (; i < ITERATIONS; i++) {
        distance = compute_distance(
            pos1.x += pos1_deltas.dx,
            pos2.x += pos2_deltas.dx,
            pos1.y += pos1_deltas.dy,
            pos2.y += pos2_deltas.dy,
        );
        if (i==0) 
            tdistance=distance;

        if (distance < 25) {
            break;
        }
    }
    return {
        score: i/10,
        distance: tdistance,
    };
}
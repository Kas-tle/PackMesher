import { Model } from "../types/model";
import { ElementCorners, FaceCorners, Quad, Vec3f, Vec4f } from "../types/util";

class Element {
    data: Model.Element;
    corners: ElementCorners;
    faces: {
        up: Face;
        down: Face;
        north: Face;
        south: Face;
        east: Face;
        west: Face;
    }
    rotated: boolean;
    rotationAxis: 'x' | 'y' | 'z' | undefined;
    rotationAngle: -45 | -22.5 | 0 | 22.5 | 45;

    constructor(data: Model.Element) {
        this.data = data;
        this.corners = this.getCorners();
        this.faces = this.getFaces();
        this.rotated = !!data.rotation && data.rotation.angle !== 0;
        this.rotationAxis = data.rotation ? data.rotation.axis : undefined;
        this.rotationAngle = data.rotation ? data.rotation.angle : 0;
    }
    
    private rotatePoint(point: Vec3f, origin: Vec3f, axis: 'x' | 'y' | 'z', angle: -45 | -22.5 | 0 | 22.5 | 45): Vec3f {
        const radians = angle * Math.PI / 180;
        const cos = Math.cos(radians);
        const sin = Math.sin(radians);
        const x = point[0] - origin[0];
        const y = point[1] - origin[1];
        const z = point[2] - origin[2];
        switch (axis) {
            case 'x':
                return [
                    x,
                    y * cos - z * sin,
                    y * sin + z * cos
                ];
            case 'y':
                return [
                    x * cos + z * sin,
                    y,
                    -x * sin + z * cos
                ];
            case 'z':
                return [
                    x * cos - y * sin,
                    x * sin + y * cos,
                    z
                ];
        }
    }

    // Get corners taking rotation into account if present
    private getCorners(): ElementCorners {
        const { from, to, rotation } = this.data;
        if (!rotation) {
            return [
                from,
                [to[0], from[1], from[2]],
                [from[0], to[1], from[2]],
                [from[0], from[1], to[2]],
                [to[0], to[1], from[2]],
                [from[0], to[1], to[2]],
                [to[0], from[1], to[2]],
                to
            ];
        } else {
            const origin = rotation.origin;
            const axis = rotation.axis;
            const angle = rotation.angle;
            return [
                this.rotatePoint(from, origin, axis, angle),
                this.rotatePoint([to[0], from[1], from[2]], origin, axis, angle),
                this.rotatePoint([from[0], to[1], from[2]], origin, axis, angle),
                this.rotatePoint([from[0], from[1], to[2]], origin, axis, angle),
                this.rotatePoint([to[0], to[1], from[2]], origin, axis, angle),
                this.rotatePoint([from[0], to[1], to[2]], origin, axis, angle),
                this.rotatePoint([to[0], from[1], to[2]], origin, axis, angle),
                this.rotatePoint(to, origin, axis, angle)
            ];
        }
    }

    // Get corners for each face from the element corners
    private getFaces(): {
        up: Face;
        down: Face;
        north: Face;
        south: Face;
        east: Face;
        west: Face;
    } {
        const [a, b, c, d, e, f, g, h] = this.corners;
        return {
            up: new Face([e, h, g, f], this.rotated, this.rotationAxis, this.rotationAngle),
            down: new Face([a, b, c, d], this.rotated, this.rotationAxis, this.rotationAngle),
            north: new Face([f, g, c, b], this.rotated, this.rotationAxis, this.rotationAngle),
            south: new Face([h, e, a, d], this.rotated, this.rotationAxis, this.rotationAngle),
            east: new Face([g, h, d, c], this.rotated, this.rotationAxis, this.rotationAngle),
            west: new Face([e, f, b, a], this.rotated, this.rotationAxis, this.rotationAngle)
        };
    }
}

class Face {
    corners: FaceCorners;
    rotated: boolean;
    rotationAxis: 'x' | 'y' | 'z' | undefined;
    rotationAngle: -45 | -22.5 | 0 | 22.5 | 45;

    constructor(corners: FaceCorners, rotated: boolean, rotationAxis: 'x' | 'y' | 'z' | undefined, rotationAngle: -45 | -22.5 | 0 | 22.5 | 45) {
        this.corners = corners;
        this.rotated = rotated;
        this.rotationAxis = rotationAxis;
        this.rotationAngle = rotationAngle;
    }
}
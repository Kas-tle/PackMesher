import { Vec3f } from "../types/util";

class OctreeNode<T> {
    public children: OctreeNode<T>[] | null;
    public data: T[];
    public bounds: AABB;
    private minElementsPerRegion: number;

    constructor(bounds: AABB, minElementsPerRegion: number) {
        this.bounds = bounds;
        this.data = [];
        this.children = null;
        this.minElementsPerRegion = minElementsPerRegion;
    }

    isLeafNode(): boolean {
        return this.children === null;
    }

    insert(item: T, itemBounds: AABB): void {
        if (!this.bounds.intersects(itemBounds)) return;

        if (this.isLeafNode()) {
            this.data.push(item);
            if (this.data.length > this.minElementsPerRegion) {
                this.subdivide();
            }
        } else {
            for (const child of this.children ?? []) {
                child.insert(item, itemBounds);
            }
        }
    }

    private subdivide(): void {
        // Subdivide this node into eight smaller nodes and redistribute the items
    }
}

class Octree<T> {
    public root: OctreeNode<T>;

    constructor(worldBounds: AABB, minElementsPerRegion: number) {
        this.root = new OctreeNode<T>(worldBounds, minElementsPerRegion);
    }

    insert(item: T, itemBounds: AABB): void {
        this.root.insert(item, itemBounds);
    }
}

class AABB {
    min: Vec3f;
    max: Vec3f;

    constructor(min: Vec3f, max: Vec3f) {
        this.min = min;
        this.max = max;
    }

    // Check if a point is inside this AABB
    containsPoint(point: Vec3f): boolean {
        return point[0] >= this.min[0] && point[0] <= this.max[0] &&
            point[1] >= this.min[1] && point[1] <= this.max[1] &&
            point[2] >= this.min[2] && point[2] <= this.max[2];
    }

    // Check if this AABB intersects with another AABB
    intersects(other: AABB): boolean {
        return this.min[0] <= other.max[0] && this.max[0] >= other.min[0] &&
            this.min[1] <= other.max[1] && this.max[1] >= other.min[1] &&
            this.min[2] <= other.max[2] && this.max[2] >= other.min[2];
    }
}
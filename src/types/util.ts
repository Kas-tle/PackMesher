import exp from "constants"

export type Vec2f = [number, number]
export type Vec3f = [number, number, number]
export type Vec4f = [number, number, number, number]

export type ElementCorners = [Vec3f, Vec3f, Vec3f, Vec3f, Vec3f, Vec3f, Vec3f, Vec3f]
export type FaceCorners = [Vec3f, Vec3f, Vec3f, Vec3f]
export type Quad = [Vec2f, Vec2f, Vec2f, Vec2f]

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
    ? Acc[number]
    : Enumerate<N, [...Acc, Acc['length']]>

export type Range<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>
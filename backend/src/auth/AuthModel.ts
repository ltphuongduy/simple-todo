import { JwtHeader } from 'jsonwebtoken'

/**
 * Interface representing a JWT token
 */
export interface Jwt {
    header: JwtHeader
    payload: JwtPayload
}

/**
 * A payload of a JWT token
 */
export interface JwtPayload {
    iss: string
    sub: string
    iat: number
    exp: number
}

/**
 * Interface representing a JWT token
 */
export interface Auth0Key {
    alg: string,
    kty: string,
    n: string,
    e: string,
    kid: string,
    x5t: string,
    x5c: Array<string>
}
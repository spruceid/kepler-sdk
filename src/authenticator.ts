export interface Authenticator {
  content: (
    orbit: string,
    service: string,
    path: string,
    fragment: string
  ) => Promise<HeadersInit>;
  authorizePeer: (orbit: string, peer: string) => Promise<HeadersInit>;
}

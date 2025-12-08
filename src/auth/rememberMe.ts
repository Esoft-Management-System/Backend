import { JwtService } from "@nestjs/jwt";

export async function rememberme(
  jwtService: JwtService,
  payload:Record<string,any>,
  secret:string,
  remember?:boolean
){
  const expiresIn = remember ? '7d' : '1d';
  const token = await jwtService.signAsync(payload, {
    secret,
    expiresIn,
  });
  return{token,expiresIn};
}
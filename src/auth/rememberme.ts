import { JwtService } from "@nestjs/jwt";

export  async function rememberme(
    jwtService: JwtService,
    payload:Record<string,any>,
    secret:string,
    remember?:boolean
){
    const expiresIn = remember ? '30d' : '1d';
    const token = await jwtService.signAsync(payload, {
        secret,
        expiresIn,
    });
    return{ token, expiresIn };
}

/*============================================================
short note for other asingee for using rememberme function in future

 * 
 * STAFF LOGIN (in auth.service.ts):(i actutlly think the staff code is no needed but  beacase we alrady called it in auth service)
 * 
 * 
 * import { rememberme } from './rememberme';
 * 
 * const { token, expiresIn } = await rememberme(
 *     this.jwtService,
 *     { 
 *         sub: user._id.toString(),
 *         staffId: user.staffId,
 *         email: user.email,
 *         role: user.role 
 *     },
 *     process.env.STAFF_JWT_SECRET,
 *     dto.rememberMe
 * );
 *-------------------------------------------------------------------------------------------------------------

 * // -------- STUDENT LOGIN --------
 (no student_JWT_SERCRET in .env)
 * import { rememberme } from '../auth/rememberme';
 * .env
 * 
 * const { token, expiresIn } = await rememberme(
 *     this.jwtService,
 *     { 
 *         sub: student._id.toString(),
 *         eNumber: student.eNumber,
 *         email: student.emailAddress,
 *         role: 'student' 
 *     },
 *     process.env.STUDENT_JWT_SECRET,
 *     dto.rememberMe
 * );
 *
 * -------------------------------------------------------------------------------------------------------------
 * // -------- ADMIN LOGIN --------
 * (same as mentioend above becasuse admin and staff have same logic)
 * 
// const { token, expiresIn } = await rememberme(
//     this.jwtService,
//     { sub: admin._id.toString(), email: admin.email, role: 'admin' },
//     process.env.ADMIN_JWT_SECRET,
//     dto.rememberMe
// );
 * ============================================================
 */
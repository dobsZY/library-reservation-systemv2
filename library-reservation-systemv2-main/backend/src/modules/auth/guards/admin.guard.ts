import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../../../database/entities';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const { user } = context.switchToHttp().getRequest();
    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Bu işlem yalnızca yöneticiler tarafından gerçekleştirilebilir.');
    }
    return true;
  }
}

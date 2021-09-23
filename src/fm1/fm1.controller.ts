import { Controller } from '@nestjs/common';

@Controller('fm1')
export class Fm1Controller {
    // GET /verify/:email send verification code to email
    // POST /verify/:email verify code and return token, previous application data
    // POST /apply/:token (body has application data) return success or failed

    // PERMISSIONS fm1_registrations
    // GET /admin/authValidate check if user has fm1 permissions
    // GET /admin/applications return all applications data
    // PATCH /admin/applications/:id replace application with id to mongodb and possible change on "approved", "failed", "mot-checked"
    // DELETE /admin/applications/:id Delete specific
    // DELETE /admin/applications Delete all

    // GET /verify/:email send verification code to email
    // POST /verify/:email verify code and return token, previous application data
        // POST /apply/:token (body has application data) return success or failed
        
        // PERMISSIONS fm1_registrations
        // GET /admin/authValidate check if user has fm1 permissions
    // GET /admin/applications return all applications data
    // PATCH /admin/applications/:id replace application with id to mongodb and possible change on "approved", "failed", "mot-checked"
    // DELETE /admin/applications/:id Delete specific
    // DELETE /admin/applications Delete all
}

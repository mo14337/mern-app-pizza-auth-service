import { Request, Response } from 'express';

export class TenantController {
    create(req: Request, res: Response) {
        res.status(201).json();
    }
}

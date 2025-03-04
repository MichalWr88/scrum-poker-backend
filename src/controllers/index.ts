export class IndexController {
  public getHome(req: Express.Request, res: Response): void {
    res.json();
  }

  public getData(req: Express.Request, res: Response): void {
    const data = { message: "This is some data from the server." };
    res.json();
  }
}

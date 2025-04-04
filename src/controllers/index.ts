import { RequestHandler } from "express";
import { version } from "../../package.json";
export class IndexController {
  public getStatus: RequestHandler = (req, res) => {
    res.send("Hello, world! Version: " + version);
  };
}

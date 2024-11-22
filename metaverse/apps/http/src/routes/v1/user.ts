import { Router } from "express";
import { adminRouter } from "./admin";
import { spaceRouter } from "./space";

export const userRouter = Router()

userRouter.post("/metadata", (req, res) =>{

}) 

userRouter.get("/api/v1/user/metadata/bulk", (res, req) =>{

})



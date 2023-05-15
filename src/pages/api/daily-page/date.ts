import toResponse from "@/common/helpers/toResponse";
import moment from "@/common/moment";
import { NextApiRequest, NextApiResponse } from "next";
type Data = {
  message: string
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  try {
    res.status(200).json(toResponse(moment().format('YYYY/MM/DD hh:mm:ss')));
  } catch (error) {
    res.status(500).json({ message: (error as any).message || 'Internal server error' });
  }
}
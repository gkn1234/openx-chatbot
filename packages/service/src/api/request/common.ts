import { Agent } from 'node:https';
import axios from 'axios';

export const request = axios.create({
  timeout: 10000,
  httpsAgent: new Agent({
    rejectUnauthorized: false,
  }),
});

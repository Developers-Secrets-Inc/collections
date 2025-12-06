import { InferSchema } from "../fields/types";
import { Config } from "./types";
export declare const defineConfig: <C extends Config>(config: Exact<C, Config>) => { [Col in C["collections"][number] as Col["slug"]]: {
    create: (data: InferSchema<Col["fields"]>) => Promise<any>;
    read: (id: string) => Promise<any>;
    update: (id: string, data: Partial<InferSchema<Col["fields"]>>) => Promise<any>;
    delete: (id: string) => Promise<void>;
}; };

import { Test } from './test';

export interface Accession extends Test {
    case: string;
    tests: Test[];
}
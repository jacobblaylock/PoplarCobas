import { Test } from './test-model';

export interface Accession extends Test {
    case: string;
    tests: Test[];
}
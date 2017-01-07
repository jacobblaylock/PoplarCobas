import { Accession } from './accession';

export interface Batch extends Accession {
    batchNumber: string;
    batchRunUser: string;
    batchReleaseUser?: string;
    releaseDate?: string;
    cases?: Accession[];
}
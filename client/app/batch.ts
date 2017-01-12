import { Accession } from './accession';

export interface Batch extends Accession {
    batchNumber: string;
    batchDateString: Date;
    batchRunUser: string;
    batchReleaseUser?: string;
    releaseDate?: string;
    releaseStatus?: string;
    cases?: Accession[];
}
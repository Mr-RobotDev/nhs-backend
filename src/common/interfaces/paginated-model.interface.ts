import { Model, Document, PipelineStage, FilterQuery } from 'mongoose';
import { Options } from './options.interface';
import { Result } from './result.interface';

export interface PaginatedModel<T extends Document> extends Model<T> {
  paginate(filter: FilterQuery<T>, options?: Options): Promise<Result<T>>;
  paginatedAggregation(
    pipeline: PipelineStage[],
    options?: Options,
  ): Promise<Result<T>>;
}

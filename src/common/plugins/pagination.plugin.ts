import { Schema, PipelineStage } from 'mongoose';
import { Options } from '../interfaces/options.interface';
import { Result } from '../interfaces/result.interface';

export const paginate = (schema: Schema): void => {
  schema.statics.paginate = async function <T>(
    filter: object,
    options?: Options,
  ): Promise<Result<T>> {
    let sort = '';
    if (options.sortBy) {
      const sortingCriteria: string[] = [];
      options.sortBy.split(',').forEach((sortOption) => {
        const [key, order] = sortOption.split(':');
        sortingCriteria.push((order === 'desc' ? '-' : '') + key);
      });
      sort = sortingCriteria.join(' ');
    } else {
      sort = '-createdAt';
    }

    const limit =
      options.limit && parseInt(`${options.limit}`, 10) > 0
        ? parseInt(`${options.limit}`, 10)
        : 10;
    const page =
      options.page && parseInt(`${options.page}`, 10) > 0
        ? parseInt(`${options.page}`, 10)
        : 1;
    const skip = (page - 1) * limit;

    let query = this.find(filter)
      .select(options.projection)
      .sort(sort)
      .skip(skip)
      .limit(limit);

    if (options.populate) {
      options.populate.forEach((populateOption) => {
        query = query.populate(populateOption);
      });
    }

    const countPromise = this.countDocuments(filter).exec();
    const docsPromise = query.exec();

    return Promise.all([countPromise, docsPromise]).then((values) => {
      const [totalResults, results] = values;
      const totalPages = Math.ceil(totalResults / limit);
      const result = {
        results,
        pagination: {
          page,
          limit,
          totalPages,
          totalResults,
        },
      };
      return Promise.resolve(result);
    });
  };
};

export const paginatedAggregation = (schema: Schema): void => {
  schema.statics.paginatedAggregation = async function <T>(
    pipeline: PipelineStage[],
    options?: Options,
  ): Promise<Result<T>> {
    const page = Math.max(parseInt(`${options.page}`, 10) || 1, 1);
    const limit = Math.max(parseInt(`${options.limit}`, 10) || 10, 1);
    const skip = (page - 1) * limit;

    const countPipeline = [...pipeline, { $count: 'totalResults' }];
    const dataPipeline = [...pipeline, { $skip: skip }, { $limit: limit }];

    const [totalResultsArr, results] = await Promise.all([
      this.aggregate(countPipeline).exec(),
      this.aggregate(dataPipeline).exec(),
    ]);

    const totalResults = totalResultsArr[0]?.totalResults || 0;
    const totalPages = Math.ceil(totalResults / limit);

    return {
      results,
      pagination: {
        page,
        limit,
        totalPages,
        totalResults,
      },
    };
  };
};

import ObjectID from 'bson-objectid';
import { FilterPaginationQuery } from '../middleware/req-filterpaginate.middleware';

/**
 * A class that specifies the general functions all repositories must have.
 */
export abstract class BaseRepository<T> {
  /**
   * Add a new element to the repository.
   * @async
   * @param data {Partial<T>} - The element to create
   * @returns {Promise<T>} - The created element
   */
  abstract create(data: T | Partial<T>): Promise<T>;

  /**
   * Find one element from the repository.
   * @async
   * @param filter {FilterPaginationQuery}
   * @returns {Promise<T | null>} - The found element or null
   */
  abstract findOne(filter: FilterPaginationQuery): Promise<T | null>;

  /**
   * Find an element and update its value.
   * @async
   * @param filter {FilterPaginationQuery}
   * @param data {Partial<T>} - The partial element
   * @returns {Promise<T | null>} - The updated element or null
   */
  abstract findOneAndUpdate(
    filter: FilterPaginationQuery,
    data: Partial<T>,
  ): Promise<T | null>;

  /**
   * Find an element by id and update it.
   * @async
   * @param id {string}
   * @param data {Partial<T>} - The partial element
   * @returns {Promise<T | null>} - The updated element or null
   */
  abstract findByIdAndUpdate(id: ObjectID, data: Partial<T>): Promise<T>;

  /**
   * Find an element by id.
   * @async
   * @param id {string}
   * @returns {Promise<T | null>} - The updated element or null
   */
  abstract findById(id: ObjectID): Promise<T | null>;

  /**
   * Find an element by id and remove it.
   * @async
   * @param id {string}
   * @returns {Promise<T | null>} - The updated element or null
   */
  abstract findByIdAndRemove(id: ObjectID): Promise<T | null>;

  /**
   * Find all elements that match the filter.
   * @async
   * @param filter {FilterPaginationQuery}
   * @returns {Promise<T[]>}
   */
  abstract find(filter: FilterPaginationQuery): Promise<T[]>;

  /**
   * Get the amount of elements that match this criteria
   * @async
   * @param filter FilterPaginationQuery
   * @returns {Promise<number>} - Total amount of elements found with this filter
   */
  abstract count(filter: FilterPaginationQuery): Promise<number>;

  /**
   * Find all elements that match the filter criteria in a paginated list.
   * @async
   * @param  filter {FilterPaginationQuery}
   * @returns {Promise<T>} Paginated list of elements that match the filter criteria
   */
  abstract paginate(filter: FilterPaginationQuery): Promise<T[]>;
}

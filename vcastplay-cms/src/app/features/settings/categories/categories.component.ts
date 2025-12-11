import { Component, effect, inject, Input, signal } from '@angular/core';
import { Category, SubCategory } from './category';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { CategoryService } from './category.service';
import { MenuItem, MessageService } from 'primeng/api';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { Pagination } from '../../../core/interfaces/general';

@Component({
  selector: 'app-categories',
  imports: [ PrimengUiModule, ComponentsModule ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {

  pageInfo: MenuItem = [ {label: 'Settings'}, {label: 'Categories'} ];

  categoryService = inject(CategoryService);
  message = inject(MessageService);

  isEditCategory = signal<boolean>(false);
  isEditSubCategory = signal<boolean>(false);

  showCategoryForm = signal<boolean>(false);
  showSubCategoryForm = signal<boolean>(false);

  selectedCategory!: Category | null;
  selectedSubCategory!: SubCategory | null;

  categoryData: FormGroup = new FormGroup({
    id: new FormControl(0),
    name: new FormControl(null, [ Validators.required ]),
    description: new FormControl(null, [ Validators.required ]),
  });

  subCategoryData: FormGroup = new FormGroup({
    id: new FormControl(0),
    name: new FormControl(null, [ Validators.required ]),
    description: new FormControl(null, [ Validators.required ]),
  });

  constructor() { }

  ngOnInit(): void {
    this.onLoadCategories();
  }

  ngOnDestroy(): void {
    this.subCategories.set([]);
  }

  onLoadCategories() {
    this.categoryService.onLoadCategories(1, 10);
  }

  onLoadSubCategoriesById(id: number) {
    this.subCategories.set([]);
    this.categoryService.onLoadSubCategoriesById(id, 1, 10);
  }

  onSelectionChange(item: any, type: string) {
    if (!item) return;
    if (type === 'categories') {
      this.selectedCategory = item;
      this.onLoadSubCategoriesById(item.id);
    }
  }

  onClearAll() {
    this.categoryData.reset();
    this.subCategoryData.reset();
    this.isEditCategory.set(false);
    this.isEditSubCategory.set(false);
  }

  onClickSave(type: string) {
    if (type === 'categories') {
      const { id: categoryId, name, description } = this.categoryData.value;
      if (this.categoryData.invalid) {
        this.message.add({ severity:'error', summary: 'Error', detail: 'All fields are required!' });
        return;
      };
      if (this.isEditCategory()) {
        this.categoryService.onSaveCategories(categoryId, { name, description }, 'update').subscribe({next: (res: any) => {
          const index = this.categories().findIndex((item: any) => item.id === categoryId);
          if (index !== -1) this.categories()[index] = res;
          this.message.add({severity:'success', summary: 'Success', detail: 'Category updated successfully!' });
          this.onClickCancel('categories');
        }});
      } else {
        this.categoryService.onSaveCategories(categoryId, { name, description }, 'create').subscribe({next: (res: any) => {
          this.categories.set([...this.categories(), res]);
          this.message.add({severity:'success', summary: 'Success', detail: 'Category created successfully!' });
          this.onClickCancel('categories');
        }});
      }
    } else {
      if (this.subCategoryData.invalid) {
        this.message.add({ severity:'error', summary: 'Error', detail: 'All fields are required!' });
        return;
      };
      const categoryData: any = this.selectedCategory;
      const { id, name, description } = this.subCategoryData.value;      
      if (this.isEditSubCategory()) {
        this.categoryService.onSaveSubCategories(categoryData.id, id, { name, description }, 'update').subscribe({next: (res: any) => {
          const index = this.subCategories().findIndex((item: any) => item.id == id);
          if (index !== -1) this.subCategories()[index] = res;
          this.message.add({severity:'success', summary: 'Success', detail: 'Sub Category updated successfully!' });
          this.onClickCancel('sub-categories');
        }});
      } else {
        this.categoryService.onSaveSubCategories(categoryData.id, id, { name, description }, 'create').subscribe({next: (res: any) => {
          this.subCategories.set([...this.subCategories(), res]);
          this.message.add({severity:'success', summary: 'Success', detail: 'Sub Category created successfully!' });
          this.onClickCancel('sub-categories');
        }});
      }
    }
  }

  onClickEditCategory(item: any, type: string) {
    if (type === 'categories') {
      this.isEditCategory.set(true);
      this.showCategoryForm.set(true);
      this.categoryData.patchValue(item);
    } else {
      this.isEditSubCategory.set(true);
      this.showSubCategoryForm.set(true);
      this.subCategoryData.patchValue(item);
    }
  }

  onClickRemoveCategory(item: any, type: string) {
    if (type === 'categories') {
      this.categoryService.onDeleteCategories(item.id).subscribe({next: (res: any) => {
        const index = this.categories().findIndex((category: any) => category.id == item.id);
        if (index !== -1) this.categories().splice(index, 1);
        this.message.add({severity:'success', summary: 'Success', detail: 'Category deleted successfully!' });
      }});
    } else {
      this.categoryService.onDeleteSubCategories(item.categoryId, item.id).subscribe({next: (res: any) => {
        const index = this.subCategories().findIndex((subCategory: any) => subCategory.id == item.id && subCategory.categoryId == item.categoryId);
        if (index !== -1) this.subCategories().splice(index, 1);
        this.message.add({severity:'success', summary: 'Success', detail: 'Sub Category deleted successfully!' });
      }});
    }
  }

  onClickCancel(type: string) {
    if (type === 'categories') {
      this.isEditCategory.set(false);
      this.showCategoryForm.set(false);
      this.categoryData.reset();
    } else {
      this.isEditSubCategory.set(false);
      this.showSubCategoryForm.set(false);
      this.subCategoryData.reset();
    }
  }

  onPageChange(event: any, type: string) {
    const pageNumber = event.first / event.rows + 1;
    if (type === 'groups') {
      this.paginatedCategory.currentPage = pageNumber;
      this.paginatedCategory.itemsPerPage = event.rows;
      this.categoryService.onLoadCategories(pageNumber, event.rows);
    } else {
      const groupId = this.selectedCategory ? this.selectedCategory.id : 0;
      this.paginatedSubCategory.currentPage = pageNumber;
      this.paginatedSubCategory.itemsPerPage = event.rows;
      this.categoryService.onLoadSubCategoriesById(groupId, pageNumber, event.rows);
    }
  }

  get categories() {
    return this.categoryService.categories;
  }

  get paginatedCategory() {
    return this.categoryService.paginatedCategories();
  }

  get categoryLoading() {
    return this.categoryService.categoryLoading;
  }

  get subCategories() {
    return this.categoryService.subCategories;
  }

  get paginatedSubCategory() {
    return this.categoryService.paginatedSubCategories();
  }

  get subCategoryLoading() {
    return this.categoryService.subCategoryLoading;
  }
}

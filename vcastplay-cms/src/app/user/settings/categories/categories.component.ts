import { Component, effect, inject, Input, signal } from '@angular/core';
import { Category, SubCategory } from './category';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { PrimengUiModule } from '../../../core/modules/primeng-ui/primeng-ui.module';
import { CategoryService } from './category.service';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { ComponentsModule } from '../../../core/modules/components/components.module';
import { Pagination } from '../../../shared/interfaces/general';
import { UtilityService } from '../../../core/services/utility.service';

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
  utils = inject(UtilityService);
  confirmation = inject(ConfirmationService);

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
    if (type === 'category') {
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

  onClickSave(event: Event, type: string) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: 'Do you want to save changes?',
      closable: true,
      closeOnEscape: true,
      header: 'Confirm Save',
      icon: 'pi pi-info-circle',
      rejectButtonProps: {
        label: 'Cancel',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Save',
      },
      accept: () => {
        if (type === 'category') this.onSaveCategory();
        else this.onSaveSubCategory();
      }
    })
  }

  onClickEditCategory(item: any, type: string) {
    if (type === 'category') {
      this.isEditCategory.set(true);
      this.showCategoryForm.set(true);
      this.categoryData.patchValue(item);
    } else {
      this.isEditSubCategory.set(true);
      this.showSubCategoryForm.set(true);
      this.subCategoryData.patchValue(item);
    }
  }

  onClickRemoveCategory(event: Event, item: any, type: string) {
    this.confirmation.confirm({
      target: event.target as EventTarget,
      message: `Do you want to delete this ${type}?`,
      header: 'Danger Zone',
      icon: 'pi pi-exclamation-triangle',
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true, },
      acceptButtonProps: { label: 'Delete', severity: 'danger', },
      accept: () => {
        if (type === 'category') this.onRemoveCategory(item);
        else this.onRemoveSubCategory(item);
      }
    })
  }

  onClickCancel(type: string) {
    if (type === 'category') {
      this.isEditCategory.set(false);
      this.showCategoryForm.set(false);
      this.categoryData.reset();
    } else {
      this.isEditSubCategory.set(false);
      this.showSubCategoryForm.set(false);
      this.subCategoryData.reset();
    }
  }

  onSaveCategory() {
    if (this.categoryData.invalid) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'All fields are required!' });
      return;
    };
    const { id: categoryId, name, description } = this.categoryData.value;
    const mode = this.isEditCategory() ? 'update' : 'create';

    this.categoryService.onSaveCategories(categoryId, { name, description }, mode).subscribe({
      next: (res: any) => {
        if (mode === 'create') this.categories.set([...this.categories(), res]);
        else {
          const index = this.categories().findIndex((item: any) => item.id === categoryId);
          if (index !== -1) this.categories()[index] = res;
        }
        this.message.add({severity:'success', summary: 'Success', detail: 'Category saved successfully!' });
      },
      error: (err: any) => this.message.add({severity:'error', summary: 'Error', detail: err.error.message }),
      complete: () => {
        this.onLoadCategories();
        this.onClickCancel('category')
      }
    });
  }

  onSaveSubCategory() {
    if (this.subCategoryData.invalid) {
      this.message.add({ severity:'error', summary: 'Error', detail: 'All fields are required!' });
      return;
    };

    const categoryData: any = this.selectedCategory;
    const { id, name, description } = this.subCategoryData.value;
    const mode = this.isEditSubCategory() ? 'update' : 'create';

    this.categoryService.onSaveSubCategories(categoryData.id, id, { name, description }, mode).subscribe({
      next: (res: any) => {
        if (mode === 'create') this.subCategories.set([...this.subCategories(), res]);
        else {
          const index = this.subCategories().findIndex((item: any) => item.id == id);
          if (index !== -1) this.subCategories()[index] = res;
        }
        this.message.add({severity:'success', summary: 'Success', detail: 'Sub Category saved successfully!' });
      },
      error: (err: any) => this.message.add({severity:'error', summary: 'Error', detail: err.error.message }),
      complete: () => this.onClickCancel('sub-categories')
    });
  }

  onRemoveCategory(item: any) {
    this.categoryService.onDeleteCategories(item.id).subscribe({
      next: (res: any) => {
        const index = this.categories().findIndex((category: any) => category.id == item.id);
        if (index !== -1) this.categories().splice(index, 1);
        this.message.add({severity:'success', summary: 'Success', detail: 'Category deleted successfully!' });
      },
      error: (err: any) => this.message.add({severity:'error', summary: 'Error', detail: err.error.message }),
      complete: () => this.onLoadCategories()
    });
  }

  onRemoveSubCategory(item: any) {
    this.categoryService.onDeleteSubCategories(item.categoryId, item.id).subscribe({
        next: (res: any) => {
        const index = this.subCategories().findIndex((subCategory: any) => subCategory.id == item.id && subCategory.categoryId == item.categoryId);
        if (index !== -1) this.subCategories().splice(index, 1);
        this.message.add({severity:'success', summary: 'Success', detail: 'Sub Category deleted successfully!' });
      },
      error: (err: any) => this.message.add({severity:'error', summary: 'Error', detail: err.error.message }),
      complete: () => this.onLoadSubCategoriesById(item.categoryId)
    });
  }

  onPageChange(event: any, type: string) {
    const pageNumber = event.first / event.rows + 1;
    const rows = event.rows;
    if (type === 'category') {
      const { currentPage, itemsPerPage, ...meta } = this.paginatedCategory();
      this.paginatedCategory.set({ ...meta, currentPage: pageNumber, itemsPerPage: rows });
      this.categoryService.onLoadCategories(pageNumber, event.rows);
    } else {
      const groupId = this.selectedCategory ? this.selectedCategory.id : 0;
      const { currentPage, itemsPerPage, ...meta } = this.paginatedSubCategory();
      this.categoryService.onLoadSubCategoriesById(groupId, pageNumber, event.rows);
    }
  }

  get categories() {
    return this.categoryService.categories;
  }

  get paginatedCategory() {
    return this.categoryService.paginatedCategories;
  }

  get categoryLoading() {
    return this.categoryService.categoryLoading;
  }

  get subCategories() {
    return this.categoryService.subCategories;
  }

  get paginatedSubCategory() {
    return this.categoryService.paginatedSubCategories;
  }

  get subCategoryLoading() {
    return this.categoryService.subCategoryLoading;
  }
}

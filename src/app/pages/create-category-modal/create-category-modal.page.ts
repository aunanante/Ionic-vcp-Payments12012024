import { Component, OnInit, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { CategoryService } from '../../services/category.service'; // Replace with the correct path
import { Router } from '@angular/router';

@Component({
  selector: 'app-create-category-modal',
  templateUrl: './create-category-modal.page.html',
  styleUrls: ['./create-category-modal.page.scss'],
})
export class CreateCategoryModalPage implements OnInit {

  @Input() categoryData: any;
  @Input() commerceName!: string;
  formSubmitted: boolean = false;


  constructor(
    private modalController: ModalController,
    private categoryService: CategoryService,
    private router: Router) { }

  closeModal() {
    this.modalController.dismiss();
  }

  async createCategory() {
    try {
      if (this.formSubmitted) {
        return; // Prevent multiple submissions
      }

      // Set the formSubmitted flag to true
      this.formSubmitted = true;

      // Call the createCategory method of your CategoryService
      await this.categoryService.createCategory(
        this.categoryData.categoryname,
        this.categoryData.ville_id,
        this.categoryData.business_owner_id,
        this.categoryData.commerce_id
      );

      // Dismiss the modal with a "true" value to indicate success
      this.modalController.dismiss(true);

      // Route to /villes-commerces after creating the category
      // this.router.navigate(['/villes-commerces']);
    } catch (error) {
      console.error('Error creating category:', error);
      // You can handle errors here, e.g., show an error message to the user

      // Set the formSubmitted flag back to false to allow another submission
      this.formSubmitted = false;
    }
  }

  ngOnInit() {

  } 

}

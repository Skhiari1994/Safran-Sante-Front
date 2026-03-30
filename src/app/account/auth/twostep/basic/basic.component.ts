import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-basic',
  templateUrl: './basic.component.html',
  styleUrls: ['./basic.component.scss']
})

/**
 * Two Step Basic Component
 */
export class BasicComponent implements OnInit {

  // set the current year
  year: number = new Date().getFullYear();
  token!:string
  constructor(private authService:AuthenticationService,private router: Router) { }

  ngOnInit(): void {
  }

   /**
   * Confirm Otp Verification
   */
    config = {
      allowNumbersOnly: true,
      length: 6,
      isPasswordInput: false,
      disableAutoFocus: false,
      placeholder: '',
      inputStyles: {
        'width': '50px',
        'height': '50px'
      }
    };
    confirmeCompte() {
      this.authService.confirmeCompte(this.token).subscribe({
        next: (data: any) => {
          console.log(data);
          Swal.fire({
            position: 'top-end',
            icon: 'success',
            title: 'Opération effectuée avec succès',
            showConfirmButton: false,
            timer: 2000
          });
          this.router.navigate(['/auth/reset-password']);
        },
        error: (error) => {
          console.error("Error:", error);
          // Display an error message to the user
         // this.displayErrorMessage(error);
        }
      });
    }
onOtpChange(otp: string)
{
  this.token=otp
  
}
}

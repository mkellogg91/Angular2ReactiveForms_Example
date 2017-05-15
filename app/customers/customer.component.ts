import { Component, OnInit } from '@angular/core';
import {FormGroup, FormBuilder, Validators, AbstractControl, ValidatorFn, FormArray} from '@angular/forms';

import { Customer } from './customer';
                                                //return type V
function myCustomValidator(min: number, max: number): ValidatorFn {
    return (c : AbstractControl): {[key: string]: boolean} | null => {
        if(c.value != undefined && (isNaN(c.value) || c.value < min || c.value > max)){
            return {'range': true};
        }
        return null;
    }
}

function emailMatcher(c: AbstractControl){
    let emailControl = c.get('email');
    let confirmControl = c.get('confirmEmail');

    if(emailControl.pristine || confirmControl.pristine){
        return null;
    }
    
    if(emailControl.value === confirmControl.value){
        return null;
    }
    return {'match': true};
}


@Component({
    selector: 'my-signup',
    templateUrl: './app/customers/customer.component.html'
})
export class CustomerComponent implements OnInit {
    customerForm: FormGroup;
    //customer: Customer= new Customer();
    emailMessage: string;

    private emailValidationMessages = {
        required: 'Please enter your email address.',
        pattern: 'Please enter a valid email address.'
    };


    // <FormArray> is a cast operator
    get addresses(): FormArray{
        return <FormArray>this.customerForm.get('addresses');
    }


    constructor(private fb: FormBuilder){
        
    }   

    ngOnInit(): void{
            // form model tracks form value and state
        this.customerForm = this.fb.group({
            firstName: ['', [Validators.required, Validators.minLength(3)]],
            lastName: ['', [Validators.required, Validators.maxLength(50)]],
            emailGroup: this.fb.group({
                email: ['', [Validators.required, Validators.pattern('[a-z0-9._%+-]+@[a-z0-9.-]+')]],
                confirmEmail: ['', [Validators.required]],
            }, {validator: emailMatcher}),
            phone: '',
            notification: 'email',
            rating: ['', myCustomValidator(1, 5)],
            sendCatalog: true,
            addresses: this.fb.array([this.buildAddress() ])
        });

        this.customerForm.get('notification').valueChanges
            .subscribe(value => this.setNotification(value));
        
        const emailControl = this.customerForm.get('emailGroup.email');
        emailControl.valueChanges
            .subscribe(value => this.setMessage(emailControl))
    }

    setMessage(ctrl: AbstractControl): void {
        this.emailMessage = '';
        if((ctrl.touched || ctrl.dirty) && ctrl.errors){
            this.emailMessage = Object.keys(ctrl.errors).map(key =>
                this.emailValidationMessages[key]).join(' ');
        }
    }

    save() {
        console.log(this.customerForm);
        console.log('Saved: ' + JSON.stringify(this.customerForm.value));

    }

    populateTestData(){
        this.customerForm.setValue({
            firstName: 'Jack',
            lastName: 'Harkness',
            emailGroup: {
                email: 'jack@stupidface.com',
                confirmEmail: 'jack@stupidface.com',
            },
            phone: '12345678',
            notification: 'text',
            rating: '4',
            sendCatalog: false
        });
    }

    clearfilters(){
        this.customerForm.reset();
        
        // this.customerForm.setValue({
        //     firstName: '',
        //     lastName: '',
        //     email: '',
        //     phone: '',
        //     notification: '',
        //     sendCatalog: false
        // });
    }

    setNotification(notifyVia: String): void {
        const phoneControl = this.customerForm.get('phone');
        if(notifyVia === 'text'){
            phoneControl.setValidators(Validators.required);
        }
        else{
            phoneControl.clearValidators();
        }
        phoneControl.updateValueAndValidity();
    }

    buildAddress(): FormGroup {
        return this.fb.group({
            addressType: 'home',
            street1: '',
            street2: '',
            city: '',
            state: '',
            zip: ''
        });
    }

    addAddress(): void{
        this.addresses.push(this.buildAddress());
    }

    removeAddress(): void{
        this.addresses.removeAt(this.addresses.length - 1);
    }

 }

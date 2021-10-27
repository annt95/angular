import { Component, OnInit, Input,ViewChild,Inject } from '@angular/core';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { switchMap } from 'rxjs/operators';
import { Comment } from '../shared/comment';
import { FormBuilder, FormGroup, Validators,NgForm } from '@angular/forms';

@Component({
  selector: 'app-dishdetail',
  templateUrl: './dishdetail.component.html',
  styleUrls: ['./dishdetail.component.scss']
})
export class DishdetailComponent implements OnInit {
  dishIds!: string[];
  prev!: string;
  next!: string;
  errMess: string;
  commentForm!: FormGroup;
  comment!: Comment;
  dishcopy: Dish;
  @ViewChild('cform') commentFormDirective!: NgForm;

  commentErrors = {
    'comment': '',
    'author': '',
  };
  validationCommentMessages = {
    'comment': {
      'required':      'Comment is required.',
      'minlength':     'Comment must be at least 2 characters long.',
      'maxlength':     'Comment cannot be more than 25 characters long.'
    },
    'author': {
      'required':      'Author is required.',
      'minlength':     'Author must be at least 2 characters long.',
      'maxlength':     'Author cannot be more than 25 characters long.'
    }
  };

  constructor(private dishservice: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private cm: FormBuilder,
    @Inject('BaseURL') public BaseURL
    ) {
      this.createCommentForm();
     }
  @Input()
  dish!: Dish;
  ngOnInit() {
    this.dishservice.getDishIds().subscribe(dishIds => this.dishIds = dishIds);
    this.route.params
      .pipe(switchMap((params: Params) => this.dishservice.getDish(params['id'])))
      .subscribe(dish => { this.dish = dish; this.dishcopy = dish; this.setPrevNext(dish.id); },
        errmess => this.errMess = <any>errmess );
  }

  createCommentForm() {
    this.commentForm = this.cm.group({
      comment: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ],
      author: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(25)] ]
    });
     this.commentForm.valueChanges
       .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
    }
    onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.commentErrors) {
      if (this.commentErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.commentErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationCommentMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.commentErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  setPrevNext(dishId: string) {
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index - 1) % this.dishIds.length];
    this.next = this.dishIds[(this.dishIds.length + index + 1) % this.dishIds.length];
  }
  goBack(): void {
    this.location.back();
  }

  onSubmit() {
    this.comment = this.commentForm.value;
    console.log(this.comment);
    this.dishcopy.comments.push(this.comment);
    this.dishservice.putDish(this.dishcopy)
      .subscribe(dish => {
        this.dish = dish; this.dishcopy = dish;
      },
      errmess => { this.dish = null; this.dishcopy = null; this.errMess = <any>errmess; });
    this.commentForm.reset({
      comment: '',
      author: '',
      rating: 1
      
    });
    this.commentFormDirective.resetForm();
  }

}

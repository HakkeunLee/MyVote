/// <reference path="../_refs.ts" />

module MyVote.Controllers {
    'use strict';

    //Interface extends ng.IScope from angular.d.ts TypeScript definition file
    //This allows referencing properties on the Angular $scope object without the TypeScript compiler having issues with undefined properties
    export interface AddPollScope extends ng.IScope {
        newPoll: MyVote.Services.AppServer.Models.Poll;
        submitted: boolean;
        busyMessage: string;
        errorMessage: string;
        addPollForm: any;
        setStartEndDate: string;
        defaultStartDate: string;
        defaultEndDate: string;
        startDate: string;
        endDate: string;
        multiAnswer: boolean;
        pollImage: File;
        added: boolean;
        showAccordion: boolean;
        
        answerLetter(n: number): string;
        invalidInput(name: string): boolean;
        validationMessage(name: string);
        submit(): void;
        toggleAccordion(): void;
        openStartDatePicker($event): void;
        openEndDatePicker($event): void;
        dateOptions: ng.ui.bootstrap.IDatepickerConfig;
        startDateOpened: boolean;
        endDateOpened: boolean;
    }

    export class AddPollCtrl {
        static $inject = ['$scope', '$location', '$log', 'myVoteService', 'authService', 'signalrService'];

        private errorMap = {
            'newPoll.PollCategoryID': 'Please select a category.',
            'newPoll.PollQuestion': 'Please enter a question.',
            'startDate': 'Please enter a start date.',
            'endDate': 'Please enter an end date.',
            'pollOption.OptionText': 'Please enter at least two answers.',
            'newPoll.PollMinAnswers': 'Please enter the minimum number of answers.',
            'newPoll.PollMaxAnswers': 'Please enter the maximum number of answers.'
        };

        constructor(
            $scope: AddPollScope,
            $location: ng.ILocationService,
            $log: ng.ILogService,
            myVoteService: Services.MyVoteService,
            authService: Services.AuthService,
            signalrService: Services.SignalrService
        ) {
            $scope.submitted = false;
            $scope.errorMessage = null;
            $scope.busyMessage = null;
            $scope.added = false;
            
            $scope.multiAnswer = false;
            $scope.setStartEndDate = 'no';

            var pollOptions = [1, 2, 3, 4, 5].map(n => {
                return {
                    PollID: null,
                    PollOptionID: null,
                    OptionPosition: n,
                    OptionText: null,
                    Selected: false
                };
            });
            $scope.newPoll = {
                PollID: null,
                PollAdminRemovedFlag: false,
                PollCategoryID: null,
                PollDateRemoved: null,
                PollDeletedDate: null,
                PollDeletedFlag: false,
                PollStartDate: null,
                PollEndDate: null,
                PollImageLink: null,
                PollMaxAnswers: 1,
                PollMinAnswers: 1,
                UserID: authService.userId,
                PollDescription: null,
                PollQuestion: null,
                PollOptions: pollOptions
            };

            $scope.showAccordion = false;

            $scope.answerLetter = (n: number) => String.fromCharCode(65 + n);

            $scope.dateOptions = {
                showWeeks: false                             
            };

            $scope.openStartDatePicker = (event: ng.IAngularEvent) => {                
                event.preventDefault();
                event.stopPropagation();

                $scope.startDateOpened = true;                
            };

            $scope.openEndDatePicker = (event: ng.IAngularEvent) => {
                event.preventDefault();
                event.stopPropagation();

                $scope.endDateOpened = true;
            };

            $scope.invalidInput = (name: string)=> {
                var field = $scope.addPollForm[name];
                if (field === undefined) {
                    return false;
                }
                return ($scope.submitted || field.$dirty) && field.$invalid;
            };

            $scope.validationMessage = (name: string) => {
                return this.errorMap[name];
            };

            $scope.$on('$locationChangeStart', (event: ng.IAngularEvent) => {
                if (!$scope.added && $scope.addPollForm.$dirty) {
                    if (!confirm('You have unsaved changes. Choose OK to leave this page or Cancel to continue editing.')) {
                        event.preventDefault();
                    }
                }
            });

            $scope.toggleAccordion = ()=> {
                $scope.showAccordion = !($scope.showAccordion);
            };

            $scope.submit = () => {
                $scope.submitted = true;
                $scope.errorMessage = null;

                if ($scope.addPollForm.$invalid) {
                    return;
                }

                $scope.busyMessage = 'Posting Poll...';

                // remove empty options
                var finalOptions: Services.AppServer.Models.PollOption[] = [];
                var currentPosition = 0;
                for (var optionIndex = 0; optionIndex < $scope.newPoll.PollOptions.length; optionIndex++) {
                    var option = $scope.newPoll.PollOptions[optionIndex];
                    option.OptionPosition = currentPosition++;
                    if (option.OptionText) {
                        finalOptions.push(option);
                    }
                }
                $scope.newPoll.PollOptions = finalOptions;

                // if not setting start/end dates, reset to defaults
                if ($scope.setStartEndDate == 'no') {
                    $scope.startDate = $scope.defaultStartDate;
                    $scope.endDate = $scope.defaultEndDate;
                }

                if (!$scope.multiAnswer) {
                    $scope.newPoll.PollMinAnswers = 1;
                    $scope.newPoll.PollMaxAnswers = 1;
                }

                $scope.newPoll.PollStartDate = new Date(Date.parse($scope.startDate));
                $scope.newPoll.PollStartDate.setHours(0, 0, 0, 0);

                $scope.newPoll.PollEndDate = new Date(Date.parse($scope.endDate));
                $scope.newPoll.PollEndDate.setHours(11, 59, 59, 999);

                myVoteService.uploadImage($scope.pollImage)
                    .then((imageUrl: any) => {
                        $scope.newPoll.PollImageLink = imageUrl;
                        return myVoteService.savePoll($scope.newPoll);
                    }).then((poll: any) => {
                        $scope.added = true;
                        signalrService.addPoll();
                        $scope.busyMessage = 'Success! Viewing your poll...';
                        $location.path('/viewPoll/' + poll.PollID);
                    },
                    error => {
                        $scope.busyMessage = null;
                        $scope.errorMessage = UtilityService.FormatError(error, "Error saving poll.");
                    });
            };
        }
    }
}
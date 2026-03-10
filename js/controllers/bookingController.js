angular.module("rowinApp")
    .controller("BookingController", ["$scope", "BookingService", function ($scope, BookingService) {

        // ─── State ────────────────────────────────────────────────────────────────

        $scope.currentStage = 1;
        $scope.success = false;
        $scope.loading = false;

        $scope.sports = [
            { label: "Rowing", value: "rowing", desc: "Choose your skill level" },
            { label: "Kayaking", value: "kayaking", desc: "Paddle through the waters" },
            { label: "Stand Up Paddle (SUP)", value: "sup", desc: "Balance and paddle" },
            { label: "Private Rowing", value: "private-rowing", desc: "One-on-one coaching" },
            { label: "Fitness & Conditioning", value: "fitness-conditioning", desc: "Build strength and endurance" }
        ];

        $scope.levels = ["induction", "beginner", "intermediate", "advanced", "skiff"];

        $scope.timeSlots = [
            "6:00 AM", "7:15 AM", "8:30 AM", "9:45 AM",
            "11:00 AM", "4:00 PM", "5:15 PM", "6:30 PM"
        ];

        $scope.paymentMethods = [
            { label: "Cash Payment", value: "cash", desc: "Pay in cash at the academy" },
            { label: "Instapay", value: "instapay", desc: "Upload payment screenshot" }
        ];

        $scope.bookingData = {
            sport: "",
            level: "",
            quantity: 1,
            date: "",
            time: "",
            paymentMethod: "",
            screenshot: null
        };

        // ─── Auth guard ───────────────────────────────────────────────────────────

        (async function checkAuth() {
            const user = await BookingService.getUser();
            if (!user) {
                window.location.href =
                    "index.html#!/login";
            }
        })();

        // ─── Stage navigation ──────────────────────────────────────────────────────

        $scope.goToStage = function (stage) {
            if (stage < 1 || stage > 3) return;
            $scope.currentStage = stage;
        };

        // ─── Sport selection ──────────────────────────────────────────────────────

        $scope.selectSport = function (value) {
            $scope.bookingData.sport = value;
            // Clear level when sport changes away from rowing
            if (value !== "rowing") {
                $scope.bookingData.level = "";
            }
        };

        // ─── Time selection ───────────────────────────────────────────────────────

        $scope.selectTime = function (t) {
            $scope.bookingData.time = t;
        };

        // ─── Payment method selection ─────────────────────────────────────────────

        $scope.selectPayment = function (m) {
            $scope.bookingData.paymentMethod = m;
            if (m !== "instapay") {
                $scope.bookingData.screenshot = null;
            }
        };

        // ─── File upload ──────────────────────────────────────────────────────────

        $scope.setFile = function (files) {
            if (files && files[0]) {
                $scope.bookingData.screenshot = files[0];
            }
        };

        // ─── Validation helpers ───────────────────────────────────────────────────

        $scope.stage1Valid = function () {
            if (!$scope.bookingData.sport) return false;
            if ($scope.bookingData.sport === "rowing" && !$scope.bookingData.level) return false;
            return true;
        };

        $scope.stage2Valid = function () {
            return !!$scope.bookingData.date && !!$scope.bookingData.time;
        };

        $scope.stage3Valid = function () {
            if (!$scope.bookingData.paymentMethod) return false;
            if ($scope.bookingData.paymentMethod === "instapay" && !$scope.bookingData.screenshot) return false;
            return true;
        };

        // ─── Display helpers ──────────────────────────────────────────────────────

        $scope.displaySport = function () {
            const sport = $scope.bookingData.sport;
            const level = $scope.bookingData.level;
            if (!sport) return "-";
            if (sport === "rowing" && level) {
                return "Rowing - " + capitalize(level);
            }
            return capitalize(sport.replace(/-/g, " "));
        };

        $scope.displayDate = function () {
            return $scope.bookingData.date ? formatDateDisplay($scope.bookingData.date) : "-";
        };

        $scope.displayPayment = function () {
            const method = $scope.bookingData.paymentMethod;
            if (!method) return "-";
            const found = $scope.paymentMethods.find(function (m) { return m.value === method; });
            return found ? found.label : capitalize(method);
        };

        // ─── Form submission ──────────────────────────────────────────────────────

        $scope.submitBooking = async function () {
            if ($scope.loading) return;

            $scope.loading = true;

            try {
                const user = await BookingService.getUser();
                if (!user) {
                    window.location.href = "index.html#!/login";
                    return;
                }

                const profile = await BookingService.getProfile(user.id);

                // Build display sport name for DB
                let sportName = $scope.bookingData.sport;
                if ($scope.bookingData.sport === "rowing" && $scope.bookingData.level) {
                    sportName = "Rowing - " + $scope.bookingData.level;
                } else if ($scope.bookingData.sport === "fitness-conditioning") {
                    sportName = "Fitness & Conditioning";
                } else if ($scope.bookingData.sport === "private-rowing") {
                    sportName = "Private Rowing";
                } else {
                    sportName = capitalize($scope.bookingData.sport);
                }

                const booking = {
                    name: (profile ? profile.fname + " " + profile.lname : null) || user.email,
                    email_address: user.email,
                    mobile_number: (profile && profile.mobile_number) || "",
                    session_type: sportName,
                    session_date: formatDateApi($scope.bookingData.date),
                    session_time: $scope.bookingData.time,
                    payment_method: $scope.bookingData.paymentMethod,
                    level: $scope.bookingData.level || null,
                    quantity: $scope.bookingData.quantity
                };

                if ($scope.bookingData.paymentMethod === "instapay" && $scope.bookingData.screenshot) {
                    booking.payment_screenshot = $scope.bookingData.screenshot.name || "Uploaded";
                }

                await BookingService.createBooking(booking);

                // Send confirmation email (non-blocking)
                BookingService.sendBookingEmail({
                    name: booking.name,
                    email: booking.email_address,
                    date: formatDateDisplay($scope.bookingData.date),
                    time: booking.session_time,
                    sessionType: booking.session_type,
                    quantity: $scope.bookingData.quantity,
                    paymentMethod: booking.payment_method
                });

                $scope.$apply(function () {
                    $scope.success = true;
                    $scope.loading = false;
                });

            } catch (err) {
                console.error("Booking error:", err);
                $scope.$apply(function () {
                    $scope.loading = false;
                });
                alert("Error submitting booking. Please try again.");
            }
        };

        // ─── Flatpickr ────────────────────────────────────────────────────────────

        const now = new Date();
        const minDate = new Date();
        minDate.setHours(0, 0, 0, 0);

        if (now.getHours() >= 20) {
            minDate.setDate(minDate.getDate() + 2);
        } else {
            minDate.setDate(minDate.getDate() + 1);
        }

        // Initialise after Angular has rendered the element
        setTimeout(function () {
            flatpickr("#booking-date", {
                dateFormat: "d/m/Y",
                minDate: minDate,
                defaultDate: null,
                allowInput: true,
                onChange: function (selectedDates, dateStr) {
                    $scope.$apply(function () {
                        $scope.bookingData.date = dateStr;
                    });
                }
            });

            // File-upload area — click delegate (keeps the nice UI from bookings.html)
            const fileUploadArea = document.getElementById("file-upload-area");
            const fileInput = document.getElementById("payment-screenshot");
            const fileNameEl = document.getElementById("file-name");

            if (fileUploadArea && fileInput) {
                fileUploadArea.addEventListener("click", function () { fileInput.click(); });

                fileInput.addEventListener("change", function (e) {
                    const file = e.target.files[0];
                    if (file) {
                        $scope.$apply(function () { $scope.bookingData.screenshot = file; });
                        if (fileNameEl) {
                            fileNameEl.textContent = file.name;
                            fileNameEl.style.display = "block";
                        }
                        fileUploadArea.classList.add("has-file");
                    }
                });

                fileUploadArea.addEventListener("dragover", function (e) {
                    e.preventDefault();
                    fileUploadArea.style.borderColor = "#2563eb";
                });

                fileUploadArea.addEventListener("dragleave", function () {
                    fileUploadArea.style.borderColor = "#d1d5db";
                });

                fileUploadArea.addEventListener("drop", function (e) {
                    e.preventDefault();
                    fileUploadArea.style.borderColor = "#d1d5db";
                    const file = e.dataTransfer.files[0];
                    if (file) {
                        fileInput.files = e.dataTransfer.files;
                        $scope.$apply(function () { $scope.bookingData.screenshot = file; });
                        if (fileNameEl) {
                            fileNameEl.textContent = file.name;
                            fileNameEl.style.display = "block";
                        }
                        fileUploadArea.classList.add("has-file");
                    }
                });
            }
        }, 0);

        // ─── Private helpers ──────────────────────────────────────────────────────

        function capitalize(str) {
            if (!str) return "";
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        /** "d/m/Y" → "YYYY-MM-DD" for Supabase */
        function formatDateApi(dateString) {
            const parts = dateString.split("/");
            if (parts.length !== 3) return dateString;
            const day = parts[0];
            const month = parts[1];
            const year = parts[2];
            return year + "-" + month.padStart(2, "0") + "-" + day.padStart(2, "0");
        }

        /** "d/m/Y" → human-readable long date */
        function formatDateDisplay(dateString) {
            const parts = dateString.split("/");
            if (parts.length !== 3) return dateString;
            const date = new Date(parts[2], parts[1] - 1, parts[0]);
            return date.toLocaleDateString("en-US", {
                weekday: "long", year: "numeric", month: "long", day: "numeric"
            });
        }

    }]);

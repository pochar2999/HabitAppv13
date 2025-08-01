@@ .. @@
 import React, { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
-import { createPageUrl } from "@/utils";
-import { Habit } from "@/entities/Habit";
-import { UserHabit } from "@/entities/UserHabit";
-import { User } from "@/entities/User";
-import { Input } from "@/components/ui/input";
-import { Button } from "@/components/ui/button";
-import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
-import { Badge } from "@/components/ui/badge";
+import { createPageUrl } from "../utils";
+import { Habit } from "../entities/Habit";
+import { UserHabit } from "../entities/UserHabit";
+import { User } from "../entities/User";
+import { Input } from "../components/ui/input";
+import { Button } from "../components/ui/button";
+import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
+import { Badge } from "../components/ui/badge";

export default React
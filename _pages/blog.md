---
layout: master
title: Blog
permalink: /blog
description: Side projects and other assorted interests
keywords:
  - blog
---

<div class="ui text container">
  {% for post in site.posts %}
    <div class="ui stacked segment">
      <h3><a href="{{ post.url }}">{{ post.post_title }}</a></h3>
      <em>{{ post.date | date: '%B %-d, %Y' }}</em>
      <hr />
      {{ post.excerpt }}
    </div>
  {% endfor %}
</div>
